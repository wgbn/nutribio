// First-run wizard: basic profile (incl. country) + optional bioimpedance
// step + diet preferences. Saves locally and offers to generate the plan.

import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {ChipGroup, Field, NumberInput, Select, TextArea, TextInput} from '../components/Field';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {LeafIcon, SparklesIcon} from '../components/icons';
import {useStore} from '../hooks/useStore';
import {activeIntlLocale} from '../i18n/locales';
import {
  EXERCISE_TYPE_LABEL_KEYS,
  FREQUENCY_LABEL_KEYS,
  GOAL_LABEL_KEYS,
  INTENSITY_LABEL_KEYS,
  SEX_LABEL_KEYS,
} from '../lib/calculations';
import {countryOptions, defaultCountryFor, type CountryCode} from '../lib/countries';
import {todayKey} from '../lib/mealTimes';
import type {
  BioRecord,
  ExerciseFrequency,
  ExerciseIntensity,
  ExerciseType,
  Goal,
  Sex,
} from '../types';

interface FormState {
  name: string;
  sex: Sex;
  age: number | '';
  height: number | '';
  weight: number | '';
  goal: Goal;
  country: CountryCode;
  exerciseActive: boolean;
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  type: ExerciseType;
  workoutTime: string;
  excludedFoods: string;
  observations: string;
  bio: {
    weight: number | '';
    bodyFat: number | '';
    water: number | '';
    bmr: number | '';
    visceralFat: number | '';
    bmi: number | '';
    muscle: number | '';
    protein: number | '';
    boneMass: number | '';
    bodyAge: number | '';
    idealWeight: number | '';
  };
}

const emptyBio = {
  weight: '' as number | '',
  bodyFat: '' as number | '',
  water: '' as number | '',
  bmr: '' as number | '',
  visceralFat: '' as number | '',
  bmi: '' as number | '',
  muscle: '' as number | '',
  protein: '' as number | '',
  boneMass: '' as number | '',
  bodyAge: '' as number | '',
  idealWeight: '' as number | '',
};

const BIO_FIELDS: Array<{key: keyof FormState['bio']; labelKey: string}> = [
  {key: 'weight', labelKey: 'bio.weight'},
  {key: 'bodyFat', labelKey: 'bio.bodyFat'},
  {key: 'water', labelKey: 'bio.water'},
  {key: 'bmr', labelKey: 'bio.bmr'},
  {key: 'visceralFat', labelKey: 'bio.visceralFat'},
  {key: 'bmi', labelKey: 'bio.bmi'},
  {key: 'muscle', labelKey: 'bio.muscle'},
  {key: 'protein', labelKey: 'bio.protein'},
  {key: 'boneMass', labelKey: 'bio.boneMass'},
  {key: 'bodyAge', labelKey: 'bio.bodyAge'},
  {key: 'idealWeight', labelKey: 'bio.idealWeight'},
];

export function Onboarding({onDone}: {onDone: () => void}) {
  const {t} = useTranslation();
  const {settings, saveSettings, saveProfile, saveBioRecord, generatePlan} = useStore();
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    name: '',
    sex: 'male',
    age: '',
    height: '',
    weight: '',
    goal: 'lose_fat',
    // Preselect from the device region / app locale (DECISIONS #26).
    country: defaultCountryFor(navigator.languages ?? [navigator.language]),
    exerciseActive: false,
    frequency: 'none',
    intensity: 'moderate',
    type: 'mixed',
    workoutTime: '',
    excludedFoods: '',
    observations: '',
    bio: emptyBio,
  }));
  const [askGenerate, setAskGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);

  const goalOptions = useMemo(
    () => (Object.keys(GOAL_LABEL_KEYS) as Goal[]).map((g) => ({value: g, label: t(GOAL_LABEL_KEYS[g])})),
    [t],
  );
  const sexOptions = useMemo(
    () => (Object.keys(SEX_LABEL_KEYS) as Sex[]).map((s) => ({value: s, label: t(SEX_LABEL_KEYS[s])})),
    [t],
  );
  const freqOptions = useMemo(
    () =>
      (Object.keys(FREQUENCY_LABEL_KEYS) as ExerciseFrequency[])
        .filter((f) => f !== 'none')
        .map((f) => ({value: f, label: t(FREQUENCY_LABEL_KEYS[f])})),
    [t],
  );
  const intensityOptions = useMemo(
    () =>
      (Object.keys(INTENSITY_LABEL_KEYS) as ExerciseIntensity[]).map((i) => ({
        value: i,
        label: t(INTENSITY_LABEL_KEYS[i]),
      })),
    [t],
  );
  const typeOptions = useMemo(
    () =>
      (Object.keys(EXERCISE_TYPE_LABEL_KEYS) as ExerciseType[]).map((ty) => ({
        value: ty,
        label: t(EXERCISE_TYPE_LABEL_KEYS[ty]),
      })),
    [t],
  );
  const countryOpts = useMemo(() => countryOptions(activeIntlLocale()), []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({...f, [key]: value}));
  const setBio = (key: keyof FormState['bio'], value: number | '') =>
    setForm((f) => ({...f, bio: {...f.bio, [key]: value}}));

  const basicValid = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.age !== '' &&
      form.age > 0 &&
      form.height !== '' &&
      form.height > 0 &&
      form.weight !== '' &&
      form.weight > 0,
    [form],
  );

  const hasBioData = useMemo(() => Object.values(form.bio).some((v) => v !== ''), [form.bio]);

  const commitAndMaybeGenerate = async () => {
    if (!basicValid) return;
    saveSettings({geminiApiKey: apiKey.trim()});
    saveProfile({
      name: form.name.trim(),
      sex: form.sex,
      age: Number(form.age),
      height: Number(form.height),
      initialWeight: Number(form.weight),
      goal: form.goal,
      country: form.country,
      exercise: {
        active: form.exerciseActive,
        frequency: form.exerciseActive ? form.frequency : 'none',
        intensity: form.intensity,
        type: form.type,
        workoutTime: form.exerciseActive ? form.workoutTime : '',
      },
      excludedFoods: form.excludedFoods.trim(),
      observations: form.observations.trim(),
      updatedAt: Date.now(),
    });
    if (hasBioData) {
      const record: BioRecord = {date: todayKey()};
      (Object.keys(form.bio) as Array<keyof FormState['bio']>).forEach((key) => {
        const v = form.bio[key];
        if (v !== '') (record as unknown as Record<string, unknown>)[key] = Number(v);
      });
      saveBioRecord(record);
    }
    setAskGenerate(true);
  };

  // Loading overlay + success/error toast are global (GenerationFeedback).
  const doGenerate = async () => {
    setAskGenerate(false);
    setGenerating(true);
    const ok = await generatePlan();
    setGenerating(false);
    if (ok) onDone();
  };

  const skipGenerate = () => {
    setAskGenerate(false);
    onDone();
  };

  return (
    <div className="min-h-dvh bg-[#f6f8f7]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-14 md:max-w-xl">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <LeafIcon size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-emerald-700">Nutribio</span>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t('onboarding.title')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboarding.intro')}</p>
            </div>

            <Field label={t('onboarding.name')}>
              <TextInput
                placeholder={t('onboarding.namePlaceholder')}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>

            <Field label={t('data.sex')}>
              <ChipGroup options={sexOptions} value={form.sex} onChange={(v) => set('sex', v)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('data.age')}>
                <NumberInput value={form.age} onChange={(v) => set('age', v)} placeholder={t('onboarding.agePlaceholder')} />
              </Field>
              <Field label={t('data.height')}>
                <NumberInput value={form.height} onChange={(v) => set('height', v)} placeholder={t('onboarding.heightPlaceholder')} />
              </Field>
            </div>

            <Field label={t('data.initialWeight')}>
              <NumberInput value={form.weight} onChange={(v) => set('weight', v)} placeholder={t('onboarding.weightPlaceholder')} />
            </Field>

            <Field label={t('data.goal')}>
              <ChipGroup options={goalOptions} value={form.goal} onChange={(v) => set('goal', v)} />
            </Field>

            <Field label={t('data.country')} hint={t('data.countryHint')}>
              <Select
                options={countryOpts}
                value={form.country}
                onChange={(e) => set('country', e.target.value as CountryCode)}
              />
            </Field>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {t('data.exerciseQuestion')}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => set('exerciseActive', false)}
                    className={
                      'rounded-full px-3 py-1.5 text-xs font-medium ' +
                      (!form.exerciseActive
                        ? 'bg-slate-800 text-white'
                        : 'border border-slate-200 text-slate-500')
                    }
                  >
                    {t('common.no')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set('exerciseActive', true);
                      if (form.frequency === 'none') set('frequency', '3_4');
                    }}
                    className={
                      'rounded-full px-3 py-1.5 text-xs font-medium ' +
                      (form.exerciseActive
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 text-slate-500')
                    }
                  >
                    {t('common.yes')}
                  </button>
                </div>
              </div>
              {form.exerciseActive ? (
                <div className="space-y-4">
                  <Field label={t('data.frequency')}>
                    <ChipGroup
                      options={freqOptions}
                      value={form.frequency}
                      onChange={(v) => set('frequency', v)}
                    />
                  </Field>
                  <Field label={t('data.intensity')}>
                    <ChipGroup
                      options={intensityOptions}
                      value={form.intensity}
                      onChange={(v) => set('intensity', v)}
                    />
                  </Field>
                  <Field label={t('data.workoutType')}>
                    <Select
                      options={typeOptions}
                      value={form.type}
                      onChange={(e) => set('type', e.target.value as ExerciseType)}
                    />
                  </Field>
                  <Field
                    label={t('data.workoutTime')}
                    hint={t('data.workoutTimeHint')}
                  >
                    <input
                      type="time"
                      value={form.workoutTime}
                      onChange={(e) => set('workoutTime', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                  </Field>
                </div>
              ) : (
                <p className="text-xs text-slate-400">{t('onboarding.sedentaryNote')}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <Field
                label={t('onboarding.apiKey')}
                hint={t('onboarding.apiKeyHint')}
              >
                <div className="relative">
                  <TextInput
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    placeholder={t('onboarding.apiKeyPlaceholder')}
                    autoComplete="off"
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((s) => !s)}
                    className="absolute inset-y-0 right-1.5 my-auto h-8 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  >
                    {showKey ? t('common.hide') : t('common.show')}
                  </button>
                </div>
              </Field>
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!basicValid}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700 disabled:opacity-40"
            >
              {t('common.continue')}
            </button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t('onboarding.bio.title')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboarding.bio.intro')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BIO_FIELDS.map((f) => (
                <Field key={f.key} label={t(f.labelKey)}>
                  <NumberInput
                    value={form.bio[f.key]}
                    onChange={(v) => setBio(f.key, v)}
                    placeholder="—"
                  />
                </Field>
              ))}
            </div>


            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(0)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600 active:bg-slate-50"
              >
                {t('common.back')}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700"
              >
                {t('common.continue')}
              </button>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full text-center text-sm text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              {t('onboarding.bio.skip')}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t('onboarding.prefs.title')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboarding.prefs.intro')}</p>
            </div>

            <Field label={t('diet.excludedFoods')} hint={t('diet.excludedFoodsHint')}>
              <TextArea
                rows={4}
                placeholder={t('diet.excludedFoodsPlaceholder')}
                value={form.excludedFoods}
                onChange={(e) => set('excludedFoods', e.target.value)}
              />
            </Field>

            <Field label={t('diet.observations')} hint={t('diet.observationsHint')}>
              <TextArea
                rows={6}
                placeholder={t('diet.observationsPlaceholder')}
                value={form.observations}
                onChange={(e) => set('observations', e.target.value)}
              />
            </Field>


            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600 active:bg-slate-50"
              >
                {t('common.back')}
              </button>
              <button
                onClick={commitAndMaybeGenerate}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700"
              >
                <SparklesIcon size={16} />
                {t('onboarding.finish')}
              </button>
            </div>
            <button
              onClick={commitAndMaybeGenerate}
              className="w-full text-center text-sm text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              {t('onboarding.bio.skip')}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={askGenerate}
        title={t('onboarding.askGenerate.title')}
        message={t('onboarding.askGenerate.message')}
        confirmLabel={t('onboarding.askGenerate.confirm')}
        cancelLabel={t('onboarding.askGenerate.cancel')}
        busy={generating}
        onConfirm={doGenerate}
        onCancel={skipGenerate}
      />
    </div>
  );
}
