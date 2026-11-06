// Request validation (zod), mirroring the database CHECK constraints.
//
// The enum lists come from `@nutribio/db` so the API, the schema and the core
// unions cannot drift apart. Free-text fields keep the same length limits as
// the columns (prompt-injection / storage surface, DECISIONS #22).

import type {ExerciseFrequency, ExerciseIntensity, ExerciseType, Locale, Profile} from '@nutribio/core';
import {COUNTRY_VALUES, GOAL_VALUES, LOCALE_VALUES, SEX_VALUES} from '@nutribio/db';
import {z} from 'zod';
import {apiError} from './errors';

const FREQUENCY_VALUES = ['none', '1_2', '3_4', '5_6', '7'] as const satisfies readonly ExerciseFrequency[];
const INTENSITY_VALUES = ['low', 'moderate', 'high'] as const satisfies readonly ExerciseIntensity[];
const EXERCISE_TYPE_VALUES = ['cardio', 'strength', 'mixed', 'other'] as const satisfies readonly ExerciseType[];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const exerciseSchema = z.strictObject({
  active: z.boolean(),
  frequency: z.enum(FREQUENCY_VALUES),
  intensity: z.enum(INTENSITY_VALUES),
  type: z.enum(EXERCISE_TYPE_VALUES),
  workoutTime: z.union([z.literal(''), z.string().regex(TIME_RE)]).optional(),
});

const supplementsSchema = z.strictObject({
  wheyProtein: z.boolean(),
  creatine: z.boolean(),
});

/** The mutable half of a profile (everything except `updatedAt`). */
export const profileSchema = z.strictObject({
  name: z.string().max(60),
  sex: z.enum(SEX_VALUES),
  age: z.number().int().min(18).max(120),
  height: z.number().min(100).max(250),
  initialWeight: z.number().min(30).max(400),
  goal: z.enum(GOAL_VALUES),
  country: z.enum(COUNTRY_VALUES),
  exercise: exerciseSchema,
  supplements: supplementsSchema,
  excludedFoods: z.string().max(1000),
  observations: z.string().max(2000),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const profileUpdateSchema = z.strictObject({
  profile: profileSchema,
  locale: z.enum(LOCALE_VALUES),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Bioimpedance metrics. Only weight/body-fat/water have database ranges; the
 * other metrics mirror the "any plausible value" the scale reports.
 */
export const bioRecordSchema = z.strictObject({
  weight: z.number().min(30).max(400).optional(),
  bodyFat: z.number().min(1).max(75).optional(),
  water: z.number().min(20).max(80).optional(),
  bmr: z.number().min(0).max(10000).optional(),
  visceralFat: z.number().min(0).max(100).optional(),
  bmi: z.number().min(0).max(200).optional(),
  muscle: z.number().min(0).max(300).optional(),
  protein: z.number().min(0).max(100).optional(),
  boneMass: z.number().min(0).max(50).optional(),
  bodyAge: z.number().min(0).max(150).optional(),
  idealWeight: z.number().min(0).max(400).optional(),
});

export type BioRecordInput = z.infer<typeof bioRecordSchema>;

export const deleteAccountSchema = z.strictObject({confirm: z.literal(true)});

const historyQuerySchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

/** Parses `value` with `schema` or throws `400 validationFailed`. */
export function parseInput<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    apiError(
      400,
      'validationFailed',
      result.error.issues.map((issue) => ({path: issue.path.join('.'), code: issue.code})),
    );
  }
  return result.data;
}

export function parseHistoryQuery(value: unknown): {limit: number} {
  return parseInput(historyQuerySchema, value ?? {});
}

/** Validates a `yyyy-mm-dd` path parameter (real calendar date, not the future). */
export function parseDateParam(value: string | undefined): string {
  if (!value || !DATE_RE.test(value)) {
    apiError(400, 'validationFailed', [{path: 'date', code: 'invalid_date'}]);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    apiError(400, 'validationFailed', [{path: 'date', code: 'invalid_date'}]);
  }
  if (parsed.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    apiError(400, 'validationFailed', [{path: 'date', code: 'future_date'}]);
  }
  return value;
}

/** The mutable profile columns written to `app.profiles`. */
export function toProfileColumns(profile: ProfileInput, locale: Locale) {
  return {
    name: profile.name,
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.height,
    initialWeightKg: profile.initialWeight,
    goal: profile.goal,
    country: profile.country,
    exercise: {...profile.exercise, workoutTime: profile.exercise.workoutTime ?? ''},
    supplements: profile.supplements,
    excludedFoods: profile.excludedFoods,
    observations: profile.observations,
    locale,
  };
}

/** Field-by-field comparison, used to skip no-op history snapshots. */
export function sameProfile(previous: Profile, next: ProfileInput): boolean {
  const p = previous;
  const n = next;
  return (
    p.name === n.name &&
    p.sex === n.sex &&
    p.age === n.age &&
    p.height === n.height &&
    p.initialWeight === n.initialWeight &&
    p.goal === n.goal &&
    p.country === n.country &&
    p.exercise.active === n.exercise.active &&
    p.exercise.frequency === n.exercise.frequency &&
    p.exercise.intensity === n.exercise.intensity &&
    p.exercise.type === n.exercise.type &&
    (p.exercise.workoutTime ?? '') === (n.exercise.workoutTime ?? '') &&
    p.supplements.wheyProtein === n.supplements.wheyProtein &&
    p.supplements.creatine === n.supplements.creatine &&
    p.excludedFoods === n.excludedFoods &&
    p.observations === n.observations
  );
}
