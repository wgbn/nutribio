// Core domain types for Nutribio.

import type {LocaleSetting} from './i18n/locales';
import type {CountryCode} from './lib/countries';

export type Sex = 'male' | 'female';

export type Goal = 'maintain' | 'lose_fat' | 'lose_weight' | 'gain_mass';

export type ExerciseFrequency = 'none' | '1_2' | '3_4' | '5_6' | '7';
export type ExerciseIntensity = 'low' | 'moderate' | 'high';
export type ExerciseType = 'cardio' | 'strength' | 'mixed' | 'other';

export interface Exercise {
  active: boolean;
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  type: ExerciseType;
  /** Workout time of day, "HH:MM" (24h); empty when not set/inactive. */
  workoutTime?: string;
}

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  height: number; // cm
  initialWeight: number; // kg
  goal: Goal;
  /** Country of residence — drives cuisine hints (DECISIONS #26). */
  country: CountryCode;
  exercise: Exercise;
  /** Foods the user never wants in the diet (free text, one per line/comma). */
  excludedFoods: string;
  /** General diet instructions/observations (e.g. from a nutritionist). */
  observations: string;
  updatedAt: number;
}

/** One record from the bioimpedance scale. All fields optional except date. */
export interface BioRecord {
  date: string; // yyyy-mm-dd
  weight?: number; // kg
  bodyFat?: number; // %
  water?: number; // %
  bmr?: number; // kcal
  visceralFat?: number;
  bmi?: number;
  muscle?: number; // kg
  protein?: number; // %
  boneMass?: number; // kg
  bodyAge?: number;
  idealWeight?: number; // kg
}

export interface BiometricsState {
  latest: BioRecord | null;
  history: BioRecord[];
}

export type MealSlotId =
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'afternoon_snack'
  | 'dinner';

export type WeekDayId =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Ingredient {
  item: string;
  amountGrams: number;
  unit?: string;
  /** Reference into the plan's `shoppingItems` (canonical purchasable item). */
  shoppingKey?: string;
  /** Raw/purchase-weight equivalent of `amountGrams` (cooked→raw). */
  rawGrams?: number;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

/** Supermarket sections used to group the weekly shopping list. */
export type ShoppingCategory =
  | 'produce'
  | 'meat_fish'
  | 'dairy_eggs'
  | 'bakery_grains'
  | 'pantry'
  | 'frozen'
  | 'drinks'
  | 'other';

/** Canonical purchasable item of the weekly shopping list. */
export interface ShoppingItem {
  key: string;
  /** Display name in the plan's output language, country-typical. */
  name: string;
  category: ShoppingCategory;
  /** Typical weight of one practical unit, e.g. one egg (~60 g). */
  unitWeightGrams?: number;
  /** Typical package weight, e.g. 500 g for chicken breast. */
  packageGrams?: number;
  /** Optional package label shown in the list, e.g. "pack of 2". */
  packageLabel?: string;
}

export interface Macros {
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

/** A single dish variation for a meal slot. */
export interface Dish {
  name: string;
  description?: string;
  ingredients: Ingredient[];
  macros?: Macros;
  notes?: string;
}

export interface MealSlot {
  id: MealSlotId;
  label: string;
  timeWindow: string; // e.g. "06:00 – 09:59"
  variations: Dish[];
  selectedIndex: number;
}

export interface DayPlan {
  day: WeekDayId;
  meals: MealSlot[];
}

/** Per-meal distribution targets, used to steer the Gemini prompt. */
export interface MealSplitTarget {
  id: MealSlotId;
  label: string;
  percent: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface NutritionTargets {
  bmrMifflin: number;
  bmrHarrisBenedict: number;
  bmrAverage: number;
  activityFactor: number;
  tdee: number;
  calorieMin: number;
  calorieTarget: number;
  calorieMax: number;
  proteinG: number;
  fatG: number;
  saturatedFatLimitG: number;
  carbsG: number;
  mealSplit: MealSplitTarget[];
}

export interface Plan {
  generatedAt: number;
  inputsHash: string;
  /** Locale the plan content was generated in (dishes are in this language). */
  locale?: string;
  profileSnapshot: Profile;
  biometricsSnapshot: BioRecord | null;
  targets: NutritionTargets;
  week: DayPlan[];
  overview?: string;
  /** Canonical shopping items referenced by the ingredients' `shoppingKey`. */
  shoppingItems?: ShoppingItem[];
}

export interface Settings {
  geminiApiKey: string;
  model: string;
  /** App language: 'auto' (device language) or a specific locale. */
  locale: LocaleSetting;
}

export type TabId = 'today' | 'plan' | 'shopping' | 'progress' | 'data';
