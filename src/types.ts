// Core domain types for Nutribio.

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
}

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  height: number; // cm
  initialWeight: number; // kg
  goal: Goal;
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
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
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
  profileSnapshot: Profile;
  biometricsSnapshot: BioRecord | null;
  targets: NutritionTargets;
  week: DayPlan[];
  overview?: string;
}

export interface Settings {
  geminiApiKey: string;
  model: string;
}

export type TabId = 'today' | 'plan' | 'progress' | 'data';
