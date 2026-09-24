// Gemini integration: generates the weekly meal plan with structured output
// (JSON schema), then validates and normalizes it into our domain types.

import {GoogleGenAI} from '@google/genai';

import type {
  BioRecord,
  DayPlan,
  Dish,
  Ingredient,
  MealSlot,
  NutritionTargets,
  Profile,
  WeekDayId,
} from '../types';
import {GOAL_LABELS, mealLabel, SEX_LABELS} from './calculations';
import {describeError} from './errors';
import {parseTimeToMinutes, workoutMealIds} from './mealTimes';
import {emptyMealSlot, SLOT_ORDER, WEEK_ORDER} from './plan';
import {fmt, fmtGrams} from './units';

export class GeminiError extends Error {}

const DISH_SCHEMA = {
  type: 'object',
  properties: {
    name: {type: 'string', description: 'Nome curto e apelativo do prato, em português de Portugal'},
    description: {type: 'string', description: 'Descrição breve da preparação'},
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: {type: 'string', description: 'Ingrediente, ex.: "peito de frango grelhado"'},
          amountGrams: {type: 'number', description: 'Quantidade em gramas (precisa)'},
          unit: {type: 'string', description: 'Unidade adicional se útil, ex.: "1 unidade", "1 col. de sopa"'},
        },
        required: ['item', 'amountGrams'],
      },
    },
    macros: {
      type: 'object',
      description: 'Macros aproximados da porção inteira',
      properties: {
        kcal: {type: 'number'},
        protein: {type: 'number', description: 'gramas'},
        carbs: {type: 'number', description: 'gramas'},
        fat: {type: 'number', description: 'gramas'},
      },
      required: ['kcal', 'protein', 'carbs', 'fat'],
    },
    notes: {type: 'string', description: 'Dica de preparação ou substituição'},
  },
  required: ['name', 'ingredients'],
};

const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    slot: {type: 'string', enum: [...SLOT_ORDER]},
    variations: {
      type: 'array',
      description: 'Exatamente 3 variações de prato para esta refeição',
      items: DISH_SCHEMA,
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['slot', 'variations'],
};

const DAY_SCHEMA = {
  type: 'object',
  properties: {
    day: {type: 'string', enum: [...WEEK_ORDER]},
    meals: {type: 'array', items: MEAL_SCHEMA},
  },
  required: ['day', 'meals'],
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    overview: {type: 'string', description: 'Resumo de 2-3 frases do plano semanal'},
    week: {type: 'array', items: DAY_SCHEMA},
  },
  required: ['week'],
};

interface RawDish {
  name?: unknown;
  description?: unknown;
  ingredients?: unknown;
  macros?: unknown;
  notes?: unknown;
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function normalizeDish(raw: unknown): Dish | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as RawDish;
  if (typeof d.name !== 'string' || !Array.isArray(d.ingredients)) return null;
  const ingredients: Ingredient[] = [];
  for (const ing of d.ingredients) {
    if (!ing || typeof ing !== 'object') continue;
    const i = ing as {item?: unknown; amountGrams?: unknown; unit?: unknown};
    if (typeof i.item !== 'string' || !isNumber(i.amountGrams) || i.amountGrams <= 0) continue;
    ingredients.push({
      item: i.item,
      amountGrams: Math.round(i.amountGrams * 10) / 10,
      unit: typeof i.unit === 'string' ? i.unit : undefined,
    });
  }
  if (ingredients.length === 0) return null;

  const macros = d.macros as Record<string, unknown> | undefined;
  const macrosOk =
    macros && isNumber(macros.kcal) && isNumber(macros.protein) && isNumber(macros.carbs) && isNumber(macros.fat);
  return {
    name: d.name,
    description: typeof d.description === 'string' ? d.description : undefined,
    ingredients,
    macros: macrosOk
      ? {kcal: macros.kcal as number, protein: macros.protein as number, carbs: macros.carbs as number, fat: macros.fat as number}
      : undefined,
    notes: typeof d.notes === 'string' ? d.notes : undefined,
  };
}

export function normalizeWeek(raw: unknown): DayPlan[] {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as {week?: unknown}).week)) {
    throw new GeminiError('Resposta do Gemini sem o formato esperado.');
  }
  const byDay = new Map<WeekDayId, Map<MealSlot['id'], Dish[]>>();

  for (const day of (raw as {week: unknown[]}).week) {
    if (!day || typeof day !== 'object') continue;
    const d = day as {day?: unknown; meals?: unknown[]};
    if (typeof d.day !== 'string' || !(WEEK_ORDER as string[]).includes(d.day)) continue;
    const meals = new Map<MealSlot['id'], Dish[]>();
    for (const meal of Array.isArray(d.meals) ? d.meals : []) {
      if (!meal || typeof meal !== 'object') continue;
      const m = meal as {slot?: unknown; variations?: unknown[]};
      if (typeof m.slot !== 'string' || !(SLOT_ORDER as string[]).includes(m.slot)) continue;
      const variations = (Array.isArray(m.variations) ? m.variations : [])
        .map(normalizeDish)
        .filter((x): x is Dish => x !== null)
        .slice(0, 4);
      if (variations.length > 0) meals.set(m.slot as MealSlot['id'], variations);
    }
    byDay.set(d.day as WeekDayId, meals);
  }

  const week: DayPlan[] = WEEK_ORDER.map((day) => {
    const meals = byDay.get(day) ?? new Map();
    return {
      day,
      meals: SLOT_ORDER.map((id) => {
        const slot = emptyMealSlot(id);
        slot.variations = meals.get(id) ?? [];
        return slot;
      }),
    };
  });

  const populated = week.filter((d) => d.meals.some((m) => m.variations.length > 0));
  if (populated.length === 0) {
    throw new GeminiError('O Gemini devolveu um plano vazio. Tenta novamente.');
  }
  return populated;
}

export function buildPrompt(
  profile: Profile,
  bio: BioRecord | null,
  targets: NutritionTargets,
  weightKg: number,
): string {
  const bioLines = bio
    ? [
        `- Peso: ${fmt(bio.weight, 1)} kg`,
        bio.bodyFat !== undefined ? `- Gordura corporal: ${fmt(bio.bodyFat, 1)}%` : null,
        bio.water !== undefined ? `- Água: ${fmt(bio.water, 1)}%` : null,
        bio.bmr !== undefined ? `- Metabolismo basal (balança): ${fmt(bio.bmr)} kcal` : null,
        bio.visceralFat !== undefined ? `- Gordura visceral: ${fmt(bio.visceralFat, 1)}` : null,
        bio.bmi !== undefined ? `- IMC: ${fmt(bio.bmi, 1)}` : null,
        bio.muscle !== undefined ? `- Músculo: ${fmt(bio.muscle, 1)} kg` : null,
        bio.protein !== undefined ? `- Proteína: ${fmt(bio.protein, 1)}%` : null,
        bio.boneMass !== undefined ? `- Massa óssea: ${fmt(bio.boneMass, 1)} kg` : null,
        bio.bodyAge !== undefined ? `- Idade corporal: ${fmt(bio.bodyAge)}` : null,
        bio.idealWeight !== undefined ? `- Peso ideal: ${fmt(bio.idealWeight, 1)} kg` : null,
      ].filter((l): l is string => l !== null)
    : ['- Sem dados de bioimpedância registados.'];

  const workoutMinutes = profile.exercise.active
    ? parseTimeToMinutes(profile.exercise.workoutTime)
    : null;
  const exercise = profile.exercise.active
    ? `${profile.exercise.frequency} por semana, intensidade ${profile.exercise.intensity}, tipo ${profile.exercise.type}` +
      (workoutMinutes !== null ? `, horário do treino ${profile.exercise.workoutTime}` : '')
    : 'não pratica exercício físico';

  const workoutSection = (() => {
    if (workoutMinutes === null) return '';
    const {preId, postId} = workoutMealIds(workoutMinutes);
    const lines = [`- Horário do treino: ${profile.exercise.workoutTime}`];
    if (preId) {
      lines.push(
        `- Refeição pré-treino: ${mealLabel(preId)} — reforça hidratos de digestão moderada e proteína nesta refeição.`,
      );
    }
    if (postId) {
      lines.push(
        `- Refeição pós-treino: ${mealLabel(postId)} — reforça proteína e hidratos para recuperação nesta refeição.`,
      );
    }
    return `\n## Treino\n${lines.join('\n')}\n`;
  })();

  const splitLines = targets.mealSplit
    .map((m) => `  - ${m.label}: ${m.percent}% (~${m.kcal} kcal, ${m.proteinG} g prot, ${m.carbsG} g hidr, ${m.fatG} g gor)`)
    .join('\n');

  const excludedFoods = (profile.excludedFoods ?? '').trim();
  const observations = (profile.observations ?? '').trim();
  const preferencesLines: string[] = [];
  if (excludedFoods) {
    preferencesLines.push(`- Alimentos a excluir: ${excludedFoods} — NUNCA incluir estes alimentos em nenhum prato.`);
  }
  if (observations) {
    preferencesLines.push(`- Observações gerais do utilizador/nutricionista: ${observations} — considera estas indicações ao criar o plano.`);
  }
  const preferencesSection =
    preferencesLines.length > 0
      ? `\n## Restrições e preferências do utilizador\n${preferencesLines.join('\n')}\n`
      : '';

  return `Cria um plano alimentar semanal completo, em português de Portugal.

## Perfil do utilizador
- Nome: ${profile.name}
- Sexo: ${SEX_LABELS[profile.sex]}
- Idade: ${profile.age} anos
- Altura: ${fmt(profile.height, 0)} cm
- Peso atual: ${fmt(weightKg, 1)} kg (peso mais recente da balança ou inicial)
- Objetivo: ${GOAL_LABELS[profile.goal]}
- Exercício: ${exercise}

## Dados de bioimpedância (última medição)
${bioLines.join('\n')}

## Cálculos (já feitos — usa estes valores, não recalculas)
- TMB Mifflin-St Jeor: ${fmt(targets.bmrMifflin)} kcal
- TMB Harris-Benedict: ${fmt(targets.bmrHarrisBenedict)} kcal
- TDEE (gasto total diário): ${fmt(targets.tdee)} kcal
- Faixa calórica diária: ${fmt(targets.calorieMin)} – ${fmt(targets.calorieMax)} kcal (alvo: ${fmt(targets.calorieTarget)} kcal)
- Proteína: ${fmtGrams(targets.proteinG)} g/dia
- Gordura: ${fmtGrams(targets.fatG)} g/dia (saturada < ${fmtGrams(targets.saturatedFatLimitG)} g/dia)
- Hidratos de carbono: ${fmtGrams(targets.carbsG)} g/dia

## Distribuição calórica por refeição (alvos aproximados)
${splitLines}
${workoutSection}${preferencesSection}
## Regras obrigatórias
1. 7 dias: segunda, terça, quarta, quinta, sexta, sábado, domingo.
2. 5 refeições por dia, com EXATAMENTE 3 variações de prato em cada uma: pequeno-almoço, lanche da manhã, almoço, lanche da tarde, jantar.
3. Quantidades PRECISAS em gramas (pesadas), por exemplo "peito de frango grelhado: 180 g", "batata-doce cozida: 280 g".
4. Proteína em todas as refeições: frango, peru, peixe (pescada, dourada, robalo, salmão), ovos, atum ao natural, laticínios magros (iogurte natural 0%, queijo fresco magro, leite magro).
5. Hidratos: batata-doce, arroz, pão integral, aveia, fruta.
6. Gorduras: azeite medido (colher), queijo, iogurte, frutos secos em porção pequena. Evitar fritos, manteiga, ghee, enchidos, natas, queijos curados em excesso. Gordura saturada baixa.
7. Legumes/salada generosos no almoço e jantar.
8. Os macros de cada variação de prato devem somar aproximadamente os alvos da refeição correspondente (variação ±10-15%).
9. A soma dos macros selecionados do dia deve aproximar os totais diários.
10. Nomes de pratos curtos; notas com dicas de preparação ou trocas.
11. Respeita rigorosamente os alimentos a excluir e as observações do utilizador indicados em "Restrições e preferências do utilizador" — nenhum prato pode conter alimentos excluídos e as observações devem ser refletidas no plano.

Devolve APENAS o JSON no schema indicado.`;
}

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)```|```\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1] ?? match[2]);
      } catch {
        // fall through
      }
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
    throw new GeminiError('Não foi possível interpretar a resposta do Gemini como JSON.');
  }
}

export interface GenerateOptions {
  apiKey: string;
  model: string;
  profile: Profile;
  bio: BioRecord | null;
  targets: NutritionTargets;
  weightKg: number;
  onProgress?: (stage: string) => void;
}

/** Generate the weekly plan via Gemini. Returns the normalized week + overview. */
export async function generateWeeklyPlan(
  options: GenerateOptions,
): Promise<{week: DayPlan[]; overview: string}> {
  if (!options.apiKey.trim()) {
    throw new GeminiError('Sem chave da API Gemini. Adiciona a chave nas Definições.');
  }

  const ai = new GoogleGenAI({apiKey: options.apiKey.trim()});
  const prompt = buildPrompt(options.profile, options.bio, options.targets, options.weightKg);

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      options.onProgress?.(attempt === 0 ? 'A gerar o plano semanal…' : 'A tentar novamente…');
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
        throw new GeminiError('Resposta vazia do Gemini.');
      }
      const raw = extractJson(text);
      const week = normalizeWeek(raw);
      const overview =
        raw && typeof raw === 'object' && typeof (raw as {overview?: unknown}).overview === 'string'
          ? (raw as {overview: string}).overview
          : '';
      return {week, overview};
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof GeminiError) throw lastError;
  // Surface the real API error (e.g. "401 UNAUTHENTICATED: API key not
  // valid") instead of a generic message, so it can be diagnosed on mobile.
  throw new GeminiError(`A geração do plano falhou: ${describeError(lastError)}`);
}
