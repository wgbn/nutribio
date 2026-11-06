// Bioimpedance history — one row per measurement date and user
// (dedupe-by-date semantics of DECISIONS #10).

import {sql} from 'drizzle-orm';
import {check, date, real, timestamp, uniqueIndex, uuid} from 'drizzle-orm/pg-core';
import {appSchema} from './schema';

export const bioRecords = appSchema.table(
  'bio_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    date: date('date', {mode: 'string'}).notNull(),
    weightKg: real('weight_kg'),
    bodyFatPct: real('body_fat_pct'),
    waterPct: real('water_pct'),
    bmrKcal: real('bmr_kcal'),
    visceralFat: real('visceral_fat'),
    bmi: real('bmi'),
    muscleKg: real('muscle_kg'),
    proteinPct: real('protein_pct'),
    boneMassKg: real('bone_mass_kg'),
    bodyAge: real('body_age'),
    idealWeightKg: real('ideal_weight_kg'),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('bio_records_user_date_uq').on(t.userId, t.date),
    check('bio_records_weight_check', sql`${t.weightKg} is null or ${t.weightKg} between 30 and 400`),
    check('bio_records_body_fat_check', sql`${t.bodyFatPct} is null or ${t.bodyFatPct} between 1 and 75`),
    check('bio_records_water_check', sql`${t.waterPct} is null or ${t.waterPct} between 20 and 80`),
  ],
).enableRLS();
