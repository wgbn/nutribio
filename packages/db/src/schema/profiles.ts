// User profile (1:1 with `auth.users`) and its change history.
//
// Mirrors the core `Profile` type (DECISIONS #11/#26/#32): `excludedFoods`,
// `observations`, `country` and `supplements` are always carried through by
// every write. `user_id` → `auth.users(id)` foreign keys are added in the
// `api_role_and_grants` migration because Supabase owns that schema.

import {sql} from 'drizzle-orm';
import {check, index, integer, jsonb, real, text, timestamp, uuid} from 'drizzle-orm/pg-core';
import type {Exercise, Profile, Supplements} from '@nutribio/core';
import {appSchema} from './schema';
import {valueList} from './helpers';
import {COUNTRY_VALUES, GOAL_VALUES, LOCALE_VALUES, SEX_VALUES} from './values';

export const profiles = appSchema.table(
  'profiles',
  {
    userId: uuid('user_id').primaryKey(),
    name: text('name').notNull().default(''),
    sex: text('sex').notNull(),
    age: integer('age').notNull(),
    heightCm: real('height_cm').notNull(),
    initialWeightKg: real('initial_weight_kg').notNull(),
    goal: text('goal').notNull(),
    country: text('country').notNull(),
    exercise: jsonb('exercise').$type<Exercise>().notNull(),
    supplements: jsonb('supplements').$type<Supplements>().notNull(),
    excludedFoods: text('excluded_foods').notNull().default(''),
    observations: text('observations').notNull().default(''),
    locale: text('locale').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [
    check('profiles_sex_check', sql`${t.sex} in ${valueList(SEX_VALUES)}`),
    check('profiles_goal_check', sql`${t.goal} in ${valueList(GOAL_VALUES)}`),
    check('profiles_country_check', sql`${t.country} in ${valueList(COUNTRY_VALUES)}`),
    check('profiles_locale_check', sql`${t.locale} in ${valueList(LOCALE_VALUES)}`),
    check('profiles_age_check', sql`${t.age} between 18 and 120`),
    check('profiles_height_check', sql`${t.heightCm} between 100 and 250`),
    check('profiles_weight_check', sql`${t.initialWeightKg} between 30 and 400`),
    check('profiles_excluded_foods_length_check', sql`char_length(${t.excludedFoods}) <= 1000`),
    check('profiles_observations_length_check', sql`char_length(${t.observations}) <= 2000`),
  ],
).enableRLS();

/**
 * Snapshot of the profile before each change ("histórico de alteração de
 * dados"): the API inserts one row per profile update.
 */
export const profileHistory = appSchema.table(
  'profile_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    snapshot: jsonb('snapshot').$type<Profile>().notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [index('profile_history_user_created_idx').on(t.userId, t.createdAt.desc())],
).enableRLS();
