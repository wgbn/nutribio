// Row <-> core domain type mapping.
//
// The database is column-oriented (`height_cm`, `body_fat_pct`, `timestamptz`)
// while the shared core types are the camelCase domain model used by the web
// app and the prompt builder. `updatedAt` is epoch milliseconds, like the
// local `Profile`.

import type {BioRecord, BiometricsState, CountryCode, Goal, Profile, Sex} from '@nutribio/core';
import type {bioRecords, profiles} from '@nutribio/db';

type ProfileRow = typeof profiles.$inferSelect;
type BioRow = typeof bioRecords.$inferSelect;

export function toProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    sex: row.sex as Sex,
    age: row.age,
    height: row.heightCm,
    initialWeight: row.initialWeightKg,
    goal: row.goal as Goal,
    country: row.country as CountryCode,
    exercise: row.exercise,
    supplements: row.supplements,
    excludedFoods: row.excludedFoods,
    observations: row.observations,
    updatedAt: row.updatedAt.getTime(),
  };
}

export function toBioRecord(row: BioRow): BioRecord {
  const record: BioRecord = {date: row.date};
  if (row.weightKg !== null) record.weight = row.weightKg;
  if (row.bodyFatPct !== null) record.bodyFat = row.bodyFatPct;
  if (row.waterPct !== null) record.water = row.waterPct;
  if (row.bmrKcal !== null) record.bmr = row.bmrKcal;
  if (row.visceralFat !== null) record.visceralFat = row.visceralFat;
  if (row.bmi !== null) record.bmi = row.bmi;
  if (row.muscleKg !== null) record.muscle = row.muscleKg;
  if (row.proteinPct !== null) record.protein = row.proteinPct;
  if (row.boneMassKg !== null) record.boneMass = row.boneMassKg;
  if (row.bodyAge !== null) record.bodyAge = row.bodyAge;
  if (row.idealWeightKg !== null) record.idealWeight = row.idealWeightKg;
  return record;
}

/** Builds the `BiometricsState` shape the web app consumes (history asc). */
export function toBiometricsState(rows: BioRow[]): BiometricsState {
  const history = [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(toBioRecord);
  return {latest: history.length > 0 ? history[history.length - 1]! : null, history};
}
