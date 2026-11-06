// Live model listing for the Settings dropdown, via the Gemini API.
// Lazy-loaded (dynamic import) so the SDK stays out of the main bundle.

import {GoogleGenAI, type Model} from '@google/genai';

export interface ModelOption {
  value: string;
  label: string;
}

/**
 * Keep only Gemini text-generation models: name starts with "models/",
 * supportedActions includes "generateContent", and the short name mentions
 * "gemini" (excludes imagen/veo/embeddings/tuned models etc.).
 */
export function filterModels(models: Model[]): ModelOption[] {
  const seen = new Set<string>();
  const out: ModelOption[] = [];
  for (const model of models) {
    const name = model.name ?? '';
    if (!name.startsWith('models/')) continue;
    const short = name.slice('models/'.length);
    if (!/gemini/i.test(short)) continue;
    const actions = model.supportedActions ?? [];
    if (!actions.includes('generateContent')) continue;
    if (seen.has(short)) continue;
    seen.add(short);
    out.push({value: short, label: short});
  }
  return out.sort((a, b) => a.value.localeCompare(b.value));
}

/** Fetch the current list of usable Gemini models from the API. */
export async function fetchAvailableModels(apiKey: string): Promise<ModelOption[]> {
  const ai = new GoogleGenAI({apiKey: apiKey.trim()});
  const pager = await ai.models.list({config: {pageSize: 100}});
  const all: Model[] = [];
  for await (const model of pager) {
    all.push(model);
  }
  return filterModels(all);
}
