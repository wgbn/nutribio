// Global store: app state + localStorage persistence + plan generation.

import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';

import type {
  BioRecord,
  BiometricsState,
  MealSlotId,
  NutritionTargets,
  Plan,
  Profile,
  Settings,
  WeekDayId,
} from '../types';
import {computeTargetsFromProfile, effectiveWeight} from '../lib/calculations';
import {planInputsHash} from '../lib/hash';
import {assemblePlan} from '../lib/plan';
import {
  clearAllData,
  loadBiometrics,
  loadPlan,
  loadProfile,
  loadSettings,
  mergeBioRecord,
  removeBioRecord,
  saveBiometrics,
  savePlan,
  saveProfile,
  saveSettings,
} from '../lib/storage';

interface StoreValue {
  profile: Profile | null;
  biometrics: BiometricsState;
  plan: Plan | null;
  settings: Settings;
  targets: NutritionTargets | null;
  inputsHash: string;
  planIsCurrent: boolean;
  isGenerating: boolean;
  generationStage: string | null;
  generationError: string | null;
  saveProfile: (profile: Profile) => void;
  saveBioRecord: (record: BioRecord) => void;
  removeBioRecord: (date: string) => void;
  saveSettings: (patch: Partial<Settings>) => void;
  setSelectedVariation: (day: WeekDayId, slot: MealSlotId, index: number) => void;
  generatePlan: () => Promise<boolean>;
  dismissGenerationError: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function currentInputsHash(profile: Profile | null, biometrics: BiometricsState): string {
  if (!profile) return '';
  return planInputsHash({profile, latest: biometrics.latest});
}

export function StoreProvider({children}: {children: ReactNode}) {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [biometrics, setBiometrics] = useState<BiometricsState>(() => loadBiometrics());
  const [plan, setPlan] = useState<Plan | null>(() => loadPlan());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
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

  const inputsHash = useMemo(
    () => currentInputsHash(profile, biometrics),
    [profile, biometrics],
  );

  const targets = useMemo(() => {
    if (!profile) return null;
    return computeTargetsFromProfile(profile, biometrics.latest?.weight);
  }, [profile, biometrics.latest]);

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

  const handleGeneratePlan = useCallback(async (): Promise<boolean> => {
    if (!profile || !targets) return false;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const weightKg = effectiveWeight(profile, biometrics.latest?.weight);
      const hash = currentInputsHash(profile, biometrics);
      // Lazy-load the Gemini SDK so the app shell stays small.
      const mod = await import('../lib/gemini');
      const {week, overview} = await mod.generateWeeklyPlan({
        apiKey: settings.geminiApiKey,
        model: settings.model,
        profile,
        bio: biometrics.latest,
        targets,
        weightKg,
        onProgress: setGenerationStage,
      });
      setPlan(assemblePlan(profile, biometrics.latest, targets, week, hash, overview));
      setGenerationStage(null);
      return true;
    } catch (err) {
      setGenerationError(
        err instanceof Error && 'message' in err
          ? (err as Error).message
          : 'Erro inesperado a gerar o plano.',
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
    setSettings({geminiApiKey: '', model: settings.model});
  }, [settings.model]);

  const value = useMemo<StoreValue>(
    () => ({
      profile,
      biometrics,
      plan,
      settings,
      targets,
      inputsHash,
      planIsCurrent,
      isGenerating,
      generationStage,
      generationError,
      saveProfile: handleSaveProfile,
      saveBioRecord: handleSaveBioRecord,
      removeBioRecord: handleRemoveBioRecord,
      saveSettings: handleSaveSettings,
      setSelectedVariation: handleSetSelectedVariation,
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
      inputsHash,
      planIsCurrent,
      isGenerating,
      generationStage,
      generationError,
      handleSaveProfile,
      handleSaveBioRecord,
      handleRemoveBioRecord,
      handleSaveSettings,
      handleSetSelectedVariation,
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
