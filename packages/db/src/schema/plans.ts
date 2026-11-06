// Generated plans, their dishes, the shopping catalog, the variation
// selections and the shopping checkmarks.
//
// The plan row doubles as the generation job queue (DECISIONS #22): the worker
// claims `queued` rows with `FOR UPDATE SKIP LOCKED`, flips them to `running`
// and finishes them as `succeeded`/`failed`. Partial unique indexes enforce
// "one current plan" and "one active job" per user.

import {sql} from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type {
  BioRecord,
  Ingredient,
  Macros,
  NutritionTargets,
  Profile,
} from '@nutribio/core';
import {appSchema} from './schema';
import {valueList} from './helpers';
import {
  COUNTRY_VALUES,
  LOCALE_VALUES,
  MEAL_SLOT_VALUES,
  PLAN_ERROR_CODE_VALUES,
  PLAN_STATUS_VALUES,
  SHOPPING_CATEGORY_VALUES,
  WEEK_DAY_VALUES,
} from './values';

export const plans = appSchema.table(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    status: text('status').notNull().default('queued'),
    inputsHash: text('inputs_hash').notNull(),
    locale: text('locale').notNull(),
    country: text('country').notNull(),
    model: text('model').notNull(),
    targets: jsonb('targets').$type<NutritionTargets>().notNull(),
    profileSnapshot: jsonb('profile_snapshot').$type<Profile>().notNull(),
    biometricsSnapshot: jsonb('biometrics_snapshot').$type<BioRecord>(),
    overview: text('overview'),
    errorCode: text('error_code'),
    attempts: integer('attempts').notNull().default(0),
    isCurrent: boolean('is_current').notNull().default(false),
    queuedAt: timestamp('queued_at', {withTimezone: true}).notNull().defaultNow(),
    startedAt: timestamp('started_at', {withTimezone: true}),
    heartbeatAt: timestamp('heartbeat_at', {withTimezone: true}),
    finishedAt: timestamp('finished_at', {withTimezone: true}),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [
    check('plans_status_check', sql`${t.status} in ${valueList(PLAN_STATUS_VALUES)}`),
    check('plans_locale_check', sql`${t.locale} in ${valueList(LOCALE_VALUES)}`),
    check('plans_country_check', sql`${t.country} in ${valueList(COUNTRY_VALUES)}`),
    check(
      'plans_error_code_check',
      sql`${t.errorCode} is null or ${t.errorCode} in ${valueList(PLAN_ERROR_CODE_VALUES)}`,
    ),
    check('plans_attempts_check', sql`${t.attempts} >= 0`),
    index('plans_user_queued_idx').on(t.userId, t.queuedAt.desc()),
    index('plans_status_queued_idx').on(t.status, t.queuedAt),
    uniqueIndex('plans_one_current_uq').on(t.userId).where(sql`${t.isCurrent}`),
    uniqueIndex('plans_one_active_job_uq')
      .on(t.userId)
      .where(sql`${t.status} in ('queued', 'running')`),
  ],
).enableRLS();

export const dishes = appSchema.table(
  'dishes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, {onDelete: 'cascade'}),
    day: text('day').notNull(),
    slot: text('slot').notNull(),
    variationIndex: integer('variation_index').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    ingredients: jsonb('ingredients').$type<Ingredient[]>().notNull(),
    macros: jsonb('macros').$type<Macros>(),
    notes: text('notes'),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [
    check('dishes_day_check', sql`${t.day} in ${valueList(WEEK_DAY_VALUES)}`),
    check('dishes_slot_check', sql`${t.slot} in ${valueList(MEAL_SLOT_VALUES)}`),
    check('dishes_variation_index_check', sql`${t.variationIndex} between 0 and 3`),
    uniqueIndex('dishes_plan_slot_variation_uq').on(
      t.planId,
      t.day,
      t.slot,
      t.variationIndex,
    ),
  ],
).enableRLS();

/** Canonical purchasable items of the plan (Item 7, DECISIONS #27). */
export const planShoppingItems = appSchema.table(
  'plan_shopping_items',
  {
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, {onDelete: 'cascade'}),
    key: text('key').notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    unitWeightGrams: real('unit_weight_grams'),
    packageGrams: real('package_grams'),
    packageLabel: text('package_label'),
  },
  (t) => [
    primaryKey({columns: [t.planId, t.key]}),
    check('plan_shopping_items_category_check', sql`${t.category} in ${valueList(SHOPPING_CATEGORY_VALUES)}`),
  ],
).enableRLS();

/** The user's chosen dish variation per day/meal (optimistic write-through). */
export const planSelections = appSchema.table(
  'plan_selections',
  {
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, {onDelete: 'cascade'}),
    day: text('day').notNull(),
    slot: text('slot').notNull(),
    selectedIndex: integer('selected_index').notNull().default(0),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({columns: [t.planId, t.day, t.slot]}),
    check('plan_selections_day_check', sql`${t.day} in ${valueList(WEEK_DAY_VALUES)}`),
    check('plan_selections_slot_check', sql`${t.slot} in ${valueList(MEAL_SLOT_VALUES)}`),
    check('plan_selections_index_check', sql`${t.selectedIndex} between 0 and 3`),
  ],
).enableRLS();

/** "Bought" checkmarks of the shopping list, per plan and item key. */
export const shoppingChecks = appSchema.table(
  'shopping_checks',
  {
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, {onDelete: 'cascade'}),
    key: text('key').notNull(),
    checkedAt: timestamp('checked_at', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [primaryKey({columns: [t.planId, t.key]})],
).enableRLS();
