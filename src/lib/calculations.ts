// Deterministic local calculations: BMR (Mifflin-St Jeor & Harris-Benedict),
// TDEE, calorie range per goal and macro targets.

import type {
  Exercise,
  ExerciseFrequency,
  ExerciseIntensity,
  Goal,
  MealSlotId,
  MealSplitTarget,
  NutritionTargets,
  Profile,
  Sex,
} from '../types';

export const GOAL_LABELS: Record<Goal, string> = {
  maintain: 'Manter massa',
  lose_fat: 'Perder gordura',
  lose_weight: 'Perder peso',
  gain_mass: 'Ganhar massa',
};

export const SEX_LABELS: Record<Sex, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

export const FREQUENCY_LABELS: Record<ExerciseFrequency, string> = {
  none: 'Não faço',
  '1_2': '1–2x por semana',
  '3_4': '3–4x por semana',
  '5_6': '5–6x por semana',
  '7': 'Todos os dias',
};

export const INTENSITY_LABELS: Record<ExerciseIntensity, string> = {
  low: 'Leve',
  moderate: 'Moderada',
  high: 'Alta',
};

export const EXERCISE_TYPE_LABELS: Record<Exercise['type'], string> = {
  cardio: 'Cardio',
  strength: 'Força/musculação',
  mixed: 'Misto',
  other: 'Outro',
};

const ACTIVITY_FACTORS: Record<ExerciseFrequency, number> = {
  none: 1.2,
  '1_2': 1.375,
  '3_4': 1.55,
  '5_6': 1.725,
  '7': 1.9,
};

const INTENSITY_ADJUST: Record<ExerciseIntensity, number> = {
  low: -0.075,
  moderate: 0,
  high: 0.1,
};

/** Mifflin-St Jeor equation. */
export function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/** Revised Harris-Benedict equation. */
export function bmrHarrisBenedict(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  return sex === 'male' ? base + 88.362 : base + 447.593;
}

export function activityFactor(exercise: Exercise): number {
  const base = ACTIVITY_FACTORS[exercise.frequency];
  const adjust = exercise.active ? INTENSITY_ADJUST[exercise.intensity] : 0;
  return Math.max(1.2, base + adjust);
}

/** Calorie range per goal (moderate deficit / surplus). */
export const GOAL_CALORIE_MULTIPLIER: Record<Goal, {min: number; target: number; max: number}> = {
  maintain: {min: 0.95, target: 1.0, max: 1.05},
  lose_fat: {min: 0.8, target: 0.84, max: 0.9},
  lose_weight: {min: 0.75, target: 0.78, max: 0.84},
  gain_mass: {min: 1.05, target: 1.12, max: 1.2},
};

/** Protein target in g/kg of body weight, per goal. */
export const GOAL_PROTEIN_G_PER_KG: Record<Goal, number> = {
  maintain: 1.8,
  lose_fat: 2.0,
  lose_weight: 2.2,
  gain_mass: 2.0,
};

export const FAT_PERCENT = 0.27; // 27% of calories from fat
export const SATURATED_FAT_LIMIT_G = 20; // daily cap

export const MEAL_SPLIT: Record<MealSlotId, number> = {
  breakfast: 0.2,
  morning_snack: 0.1,
  lunch: 0.3,
  afternoon_snack: 0.15,
  dinner: 0.25,
};

export interface ComputeInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  exercise: Exercise;
}

export function computeTargets(input: ComputeInput): NutritionTargets {
  const mifflin = bmrMifflin(input.sex, input.weightKg, input.heightCm, input.age);
  const harris = bmrHarrisBenedict(input.sex, input.weightKg, input.heightCm, input.age);
  const average = (mifflin + harris) / 2;
  const factor = activityFactor(input.exercise);
  const tdee = average * factor;

  const mult = GOAL_CALORIE_MULTIPLIER[input.goal];
  const calorieTarget = Math.round(tdee * mult.target);
  const calorieMin = Math.round(tdee * mult.min);
  const calorieMax = Math.round(tdee * mult.max);

  const proteinG = Math.round(GOAL_PROTEIN_G_PER_KG[input.goal] * input.weightKg);
  const fatG = Math.round((calorieTarget * FAT_PERCENT) / 9);
  const carbsG = Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4);

  const kcalPerPercent = calorieTarget / 100;
  const mealSplit: MealSplitTarget[] = (Object.keys(MEAL_SPLIT) as MealSlotId[]).map((id) => {
    const percent = MEAL_SPLIT[id] * 100;
    const share = MEAL_SPLIT[id];
    return {
      id,
      label: mealLabel(id),
      percent: Math.round(percent),
      kcal: Math.round(kcalPerPercent * percent),
      proteinG: Math.round(proteinG * share),
      carbsG: Math.round(carbsG * share),
      fatG: Math.round(fatG * share),
    };
  });

  return {
    bmrMifflin: Math.round(mifflin),
    bmrHarrisBenedict: Math.round(harris),
    bmrAverage: Math.round(average),
    activityFactor: factor,
    tdee: Math.round(tdee),
    calorieMin,
    calorieTarget,
    calorieMax,
    proteinG,
    fatG,
    saturatedFatLimitG: SATURATED_FAT_LIMIT_G,
    carbsG,
    mealSplit,
  };
}

export function mealLabel(id: MealSlotId): string {
  switch (id) {
    case 'breakfast':
      return 'Pequeno-almoço';
    case 'morning_snack':
      return 'Lanche da manhã';
    case 'lunch':
      return 'Almoço';
    case 'afternoon_snack':
      return 'Lanche / pós-treino';
    case 'dinner':
      return 'Jantar';
  }
}

/** Effective weight for calculations: latest biometrics first, else profile. */
export function effectiveWeight(
  profile: Profile | null,
  bioWeightKg: number | undefined,
): number {
  if (bioWeightKg && bioWeightKg > 0) return bioWeightKg;
  return profile?.initialWeight ?? 70;
}

export function computeTargetsFromProfile(
  profile: Profile,
  bioWeightKg: number | undefined,
): NutritionTargets {
  return computeTargets({
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.height,
    weightKg: effectiveWeight(profile, bioWeightKg),
    goal: profile.goal,
    exercise: profile.exercise,
  });
}
