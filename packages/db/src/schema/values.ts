// Enum-like column values used by the `app` schema.
//
// The database stores them as `text` + CHECK constraints instead of Postgres
// enums (adding a value later is a plain migration, not an enum alteration).
// Every list must stay in sync with the matching union type in
// `@nutribio/core` — the API maps rows back into the core domain types.

import {LOCALES, SUPPORTED_COUNTRIES} from '@nutribio/core';

export const SEX_VALUES = ['male', 'female'] as const;

export const GOAL_VALUES = ['maintain', 'lose_fat', 'lose_weight', 'gain_mass'] as const;

export const COUNTRY_VALUES = SUPPORTED_COUNTRIES;

export const LOCALE_VALUES = LOCALES;

export const WEEK_DAY_VALUES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const MEAL_SLOT_VALUES = [
  'breakfast',
  'morning_snack',
  'lunch',
  'afternoon_snack',
  'dinner',
] as const;

export const SHOPPING_CATEGORY_VALUES = [
  'produce',
  'meat_fish',
  'dairy_eggs',
  'bakery_grains',
  'pantry',
  'frozen',
  'drinks',
  'other',
] as const;

/** Lifecycle of a generation job (background worker, phase 4.7). */
export const PLAN_STATUS_VALUES = ['queued', 'running', 'succeeded', 'failed'] as const;

/** Codes from `PlanParseError` plus the server-side failure buckets. */
export const PLAN_ERROR_CODE_VALUES = [
  'emptyResponse',
  'unparseable',
  'badResponse',
  'emptyPlan',
  'apiError',
  'timeout',
  'unknown',
] as const;

/** The three separate consents required at signup (DECISIONS #29). */
export const CONSENT_DOCUMENT_VALUES = ['terms_privacy', 'health_data', 'age_18'] as const;

export type SexValue = (typeof SEX_VALUES)[number];
export type GoalValue = (typeof GOAL_VALUES)[number];
export type PlanStatusValue = (typeof PLAN_STATUS_VALUES)[number];
export type PlanErrorCodeValue = (typeof PLAN_ERROR_CODE_VALUES)[number];
export type ConsentDocumentValue = (typeof CONSENT_DOCUMENT_VALUES)[number];
