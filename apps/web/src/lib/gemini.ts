// Gemini integration (web client): calls the SDK with the prompt/schema from
// @nutribio/core and maps core parse errors to localized messages.
//
// The prompt builder, the JSON schema and the response normalizers live in
// packages/core so the API can reuse them (DECISIONS #35). The SDK call stays
// here (and lazy-loaded — DECISIONS #12) until the API generates plans
// server-side (roadmap 4.7).

import {GoogleGenAI} from '@google/genai';
import i18next from 'i18next';

import {
  buildPrompt,
  describeError,
  parsePlanResponse,
  PLAN_SCHEMA,
  PlanParseError,
} from '@nutribio/core';
import type {BioRecord, DayPlan, NutritionTargets, Profile, ShoppingItem} from '@nutribio/core';

import {activeLocale} from '../i18n/locales';
import {coreT} from '../i18n/translate';

export class GeminiError extends Error {}

export interface GenerateOptions {
  apiKey: string;
  model: string;
  profile: Profile;
  bio: BioRecord | null;
  targets: NutritionTargets;
  weightKg: number;
  onProgress?: (stage: string) => void;
}

/** Generation progress stage keys (translated by the UI). */
export const STAGE_GENERATING = 'generation.stage.generating';
export const STAGE_RETRYING = 'generation.stage.retrying';

/** Generate the weekly plan via Gemini. Returns the normalized week + shopping catalog. */
export async function generateWeeklyPlan(
  options: GenerateOptions,
): Promise<{week: DayPlan[]; overview: string; locale: string; shoppingItems: ShoppingItem[]}> {
  if (!options.apiKey.trim()) {
    throw new GeminiError(i18next.t('errors.missingKey'));
  }

  const ai = new GoogleGenAI({apiKey: options.apiKey.trim()});
  const locale = activeLocale();
  const prompt = buildPrompt({
    profile: options.profile,
    bio: options.bio,
    targets: options.targets,
    weightKg: options.weightKg,
    locale,
    t: coreT,
  });

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      options.onProgress?.(attempt === 0 ? STAGE_GENERATING : STAGE_RETRYING);
      const response = await ai.models.generateContent({
        model: options.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: PLAN_SCHEMA,
          temperature: 0.7,
          maxOutputTokens: 65536,
        },
      });
      const text = response.text;
      if (!text) {
        throw new GeminiError(i18next.t('errors.emptyResponse'));
      }
      const {week, overview, shoppingItems} = parsePlanResponse(text, coreT);
      return {week, overview, locale, shoppingItems};
    } catch (err) {
      // Core reports failures as codes; translate them into UI messages.
      lastError =
        err instanceof PlanParseError ? new GeminiError(i18next.t(`errors.${err.code}`)) : err;
    }
  }

  if (lastError instanceof GeminiError) throw lastError;
  // Surface the real API error (e.g. "401 UNAUTHENTICATED: API key not
  // valid") instead of a generic message, so it can be diagnosed on mobile.
  throw new GeminiError(i18next.t('errors.apiFailed', {detail: describeError(lastError)}));
}
