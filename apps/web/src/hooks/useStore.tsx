// Global store: app state + localStorage persistence + plan generation.

import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import i18next from 'i18next';

import {
  assemblePlan,
  computeTargetsFromProfile,
  effectiveWeight,
  parseTimeToMinutes,
  planInputsHash,
  workoutMealIds,
  type BioRecord,
  type BiometricsState,
  type MealSlotId,
  type NutritionTargets,
  type Plan,
  type Profile,
  type WeekDayId,
  type WorkoutMeals,
} from '@nutribio/core';

import {activeLocale} from '../i18n/locales';
import {coreT} from '../i18n/translate';
import type {Settings} from '../types';
import {
  clearAllData,
  loadBiometrics,
  loadPlan,
  loadProfile,
  loadSettings,
  loadShoppingChecks,
  mergeBioRecord,
  removeBioRecord,
  saveBiometrics,
  savePlan,
  saveProfile,
  saveSettings,
  saveShoppingChecks,
  type ShoppingChecks,
} from '../lib/storage';

interface StoreValue {
  profile: Profile | null;
  biometrics: BiometricsState;
  plan: Plan | null;
  settings: Settings;
  targets: NutritionTargets | null;
  workoutMeals: WorkoutMeals | null;
  inputsHash: string;
  planIsCurrent: boolean;
  /** Bought shopping items for the CURRENT plan (by inputsHash). */
  shoppingChecks: string[];
  isGenerating: boolean;
  generationStage: string | null;
  generationError: string | null;
  saveProfile: (profile: Profile) => void;
  saveBioRecord: (record: BioRecord) => void;
  removeBioRecord: (date: string) => void;
  saveSettings: (patch: Partial<Settings>) => void;
  setSelectedVariation: (day: WeekDayId, slot: MealSlotId, index: number) => void;
  toggleShoppingItem: (key: string) => void;
  generatePlan: () => Promise<boolean>;
  dismissGenerationError: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function currentInputsHash(profile: Profile | null, biometrics: BiometricsState): string {
  if (!profile) return '';
  // Locale is part of the hash: switching language marks the plan stale
  // (DECISIONS #25). Country is part of the profile itself (DECISIONS #26).
  return planInputsHash({profile, latest: biometrics.latest, locale: activeLocale()});
}

export function StoreProvider({children}: {children: ReactNode}) {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [biometrics, setBiometrics] = useState<BiometricsState>(() => loadBiometrics());
  const [plan, setPlan] = useState<Plan | null>(() => loadPlan());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [shoppingChecks, setShoppingChecks] = useState<ShoppingChecks>(() => loadShoppingChecks());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveBiometrics(biometrics);
  }, [biometrics]);

  useEffect(() => {
    if (plan) savePlan(plan);
  }, [plan]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveShoppingChecks(shoppingChecks);
  }, [shoppingChecks]);

  const inputsHash = useMemo(
    () => currentInputsHash(profile, biometrics),
    [profile, biometrics],
  );

  const targets = useMemo(() => {
    if (!profile) return null;
    return computeTargetsFromProfile(profile, biometrics.latest?.weight, coreT);
  }, [profile, biometrics.latest]);

  /** Pre/post-workout meal ids derived from the profile's workout time. */
  const workoutMeals = useMemo<WorkoutMeals | null>(() => {
    if (!profile?.exercise.active) return null;
    const minutes = parseTimeToMinutes(profile.exercise.workoutTime);
    return minutes === null ? null : workoutMealIds(minutes);
  }, [profile]);

  const planIsCurrent = !!plan && plan.inputsHash === inputsHash;

  const handleSaveProfile = useCallback((next: Profile) => {
    setProfile({...next, updatedAt: Date.now()});
  }, []);

  const handleSaveBioRecord = useCallback((record: BioRecord) => {
    setBiometrics((prev) => mergeBioRecord(prev, record));
  }, []);

  const handleRemoveBioRecord = useCallback((date: string) => {
    setBiometrics((prev) => removeBioRecord(prev, date));
  }, []);

  const handleSaveSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({...prev, ...patch}));
  }, []);

  const handleSetSelectedVariation = useCallback(
    (day: WeekDayId, slot: MealSlotId, index: number) => {
      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          week: prev.week.map((d) =>
            d.day === day
              ? {
                  ...d,
                  meals: d.meals.map((m) =>
                    m.id === slot
                      ? {...m, selectedIndex: Math.max(0, Math.min(index, m.variations.length - 1))}
                      : m,
                  ),
                }
              : d,
          ),
        };
      });
    },
    [],
  );

  const handleToggleShoppingItem = useCallback((key: string) => {
    setShoppingChecks((prev) => {
      const bought = prev.bought.includes(key)
        ? prev.bought.filter((k) => k !== key)
        : [...prev.bought, key];
      return {...prev, bought};
    });
  }, []);

  const handleGeneratePlan = useCallback(async (): Promise<boolean> => {
    if (!profile || !targets) return false;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const weightKg = effectiveWeight(profile, biometrics.latest?.weight);
      const hash = currentInputsHash(profile, biometrics);
      // Lazy-load the Gemini SDK so the app shell stays small.
      const mod = await import('../lib/gemini');
      const {week, overview, locale, shoppingItems} = await mod.generateWeeklyPlan({
        apiKey: settings.geminiApiKey,
        model: settings.model,
        profile,
        bio: biometrics.latest,
        targets,
        weightKg,
        onProgress: setGenerationStage,
      });
      setPlan(
        assemblePlan(profile, biometrics.latest, targets, week, hash, overview, locale, shoppingItems),
      );
      // The new plan has a new hash: previous "bought" marks don't apply.
      setShoppingChecks({planHash: hash, bought: []});
      setGenerationStage(null);
      return true;
    } catch (err) {
      setGenerationError(
        err instanceof Error && 'message' in err
          ? (err as Error).message
          : i18next.t('errors.unexpected'),
      );
      return false;
    } finally {
      setIsGenerating(false);
      setGenerationStage(null);
    }
  }, [profile, targets, biometrics, settings]);

  const handleResetAll = useCallback(() => {
    clearAllData();
    setProfile(null);
    setBiometrics({latest: null, history: []});
    setPlan(null);
    setShoppingChecks({planHash: '', bought: []});
    // The language preference is a device setting — keep it on reset.
    setSettings({geminiApiKey: '', model: settings.model, locale: settings.locale});
  }, [settings.model, settings.locale]);

  const value = useMemo<StoreValue>(
    () => ({
      profile,
      biometrics,
      plan,
      settings,
      targets,
      workoutMeals,
      inputsHash,
      planIsCurrent,
      // "Bought" marks only apply to the plan they were recorded for.
      shoppingChecks:
        plan && shoppingChecks.planHash === inputsHash ? shoppingChecks.bought : [],
      isGenerating,
      generationStage,
      generationError,
      saveProfile: handleSaveProfile,
      saveBioRecord: handleSaveBioRecord,
      removeBioRecord: handleRemoveBioRecord,
      saveSettings: handleSaveSettings,
      setSelectedVariation: handleSetSelectedVariation,
      toggleShoppingItem: handleToggleShoppingItem,
      generatePlan: handleGeneratePlan,
      dismissGenerationError: () => setGenerationError(null),
      resetAll: handleResetAll,
    }),
    [
      profile,
      biometrics,
      plan,
      settings,
      targets,
      workoutMeals,
      inputsHash,
      planIsCurrent,
      shoppingChecks,
      isGenerating,
      generationStage,
      generationError,
      handleSaveProfile,
      handleSaveBioRecord,
      handleRemoveBioRecord,
      handleSaveSettings,
      handleSetSelectedVariation,
      handleToggleShoppingItem,
      handleGeneratePlan,
      handleResetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
