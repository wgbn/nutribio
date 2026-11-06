// "Data" screen: single form with profile (incl. country), goal/exercise and
// bioimpedance. Saving a bioimpedance record adds it to the history
// (dedupe by date). Saving asks whether to regenerate the plan (confirm dialog).

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {
  computeTargets,
  countryOptions,
  todayKey,
  EXERCISE_TYPE_LABEL_KEYS,
  FREQUENCY_LABEL_KEYS,
  GOAL_LABEL_KEYS,
  INTENSITY_LABEL_KEYS,
  SEX_LABEL_KEYS,
  type BioRecord,
  type CountryCode,
  type ExerciseFrequency,
  type ExerciseIntensity,
  type ExerciseType,
  type Goal,
  type Profile,
  type Sex,
  type Supplements,
} from '@nutribio/core';

import {ChipGroup, Checkbox, Field, NumberInput, Select, TextInput} from '../components/Field';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {CheckIcon, GearIcon, PencilIcon, SparklesIcon, TrashIcon} from '../components/icons';
import {useStore} from '../hooks/useStore';
import {activeIntlLocale} from '../i18n/locales';
import {coreT} from '../i18n/translate';
import {fmt, fmtDate} from '../lib/units';

type Num = number | '';

interface BioForm {
  date: string;
  weight: Num;
  bodyFat: Num;
  water: Num;
  bmr: Num;
  visceralFat: Num;
  bmi: Num;
  muscle: Num;
  protein: Num;
  boneMass: Num;
  bodyAge: Num;
  idealWeight: Num;
}

type BioNumKey = Exclude<keyof BioForm, 'date'>;

interface FormState {
  name: string;
  sex: Sex;
  age: Num;
  height: Num;
  initialWeight: Num;
  goal: Goal;
  country: CountryCode;
  supplements: Supplements;
  exerciseActive: boolean;
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  type: ExerciseType;
  workoutTime: string;
  bioDate: string;
  bio: BioForm;
}

function toNum(v: number | undefined, fallback: Num = ''): Num {
  return v !== undefined && Number.isFinite(v) ? v : fallback;
}

const BIO_KEYS: BioNumKey[] = [
  'weight',
  'bodyFat',
  'water',
  'bmr',
  'visceralFat',
  'bmi',
  'muscle',
  'protein',
  'boneMass',
  'bodyAge',
  'idealWeight',
];

const BIO_LABEL_KEYS: Record<BioNumKey, string> = {
  weight: 'bio.weight',
  bodyFat: 'bio.bodyFat',
  water: 'bio.water',
  bmr: 'bio.bmr',
  visceralFat: 'bio.visceralFat',
  bmi: 'bio.bmi',
  muscle: 'bio.muscle',
  protein: 'bio.protein',
  boneMass: 'bio.boneMass',
  bodyAge: 'bio.bodyAge',
  idealWeight: 'bio.idealWeight',
};

export function EditData({
  onOpenSettings,
  newMeasurementSignal = 0,
}: {
  onOpenSettings: () => void;
  /** Increment to start a fresh bioimpedance form (used by Progress' CTA). */
  newMeasurementSignal?: number;
}) {
  const {t} = useTranslation();
  const {profile, biometrics, targets, saveProfile, saveBioRecord, removeBioRecord, generatePlan} =
    useStore();
  const currentTargets = targets;
  const latest = biometrics.latest;

  const [form, setForm] = useState<FormState>(() => ({
    name: profile?.name ?? '',
    sex: profile?.sex ?? 'male',
    age: toNum(profile?.age),
    height: toNum(profile?.height),
    initialWeight: toNum(profile?.initialWeight),
    goal: profile?.goal ?? 'lose_fat',
    country: profile?.country ?? 'PT',
    supplements: profile?.supplements ?? {wheyProtein: false, creatine: false},
    exerciseActive: profile?.exercise.active ?? false,
    frequency: profile?.exercise.frequency ?? 'none',
    intensity: profile?.exercise.intensity ?? 'moderate',
    type: profile?.exercise.type ?? 'mixed',
    workoutTime: profile?.exercise.workoutTime ?? '',
    bioDate: todayKey(),
    bio: {
      date: todayKey(),
      weight: toNum(latest?.weight, toNum(profile?.initialWeight)),
      bodyFat: toNum(latest?.bodyFat),
      water: toNum(latest?.water),
      bmr: toNum(latest?.bmr),
      visceralFat: toNum(latest?.visceralFat),
      bmi: toNum(latest?.bmi),
      muscle: toNum(latest?.muscle),
      protein: toNum(latest?.protein),
      boneMass: toNum(latest?.boneMass),
      bodyAge: toNum(latest?.bodyAge),
      idealWeight: toNum(latest?.idealWeight),
    },
  }));

  const [askGenerate, setAskGenerate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

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

  /** Start a fresh measurement form (empty fields, today's date). */
  const clearBioForm = useCallback(() => {
    setForm((f) => ({
      ...f,
      bioDate: todayKey(),
      bio: {date: todayKey(), weight: '', bodyFat: '', water: '', bmr: '', visceralFat: '', bmi: '', muscle: '', protein: '', boneMass: '', bodyAge: '', idealWeight: ''},
    }));
    setNotice(null);
  }, []);

  /** Load a past record into the form (saving replaces that date). */
  const loadRecord = useCallback(
    (record: BioRecord) => {
      setForm((f) => ({
        ...f,
        bioDate: record.date,
        bio: {
          date: record.date,
          weight: toNum(record.weight),
          bodyFat: toNum(record.bodyFat),
          water: toNum(record.water),
          bmr: toNum(record.bmr),
          visceralFat: toNum(record.visceralFat),
          bmi: toNum(record.bmi),
          muscle: toNum(record.muscle),
          protein: toNum(record.protein),
          boneMass: toNum(record.boneMass),
          bodyAge: toNum(record.bodyAge),
          idealWeight: toNum(record.idealWeight),
        },
      }));
      setNotice(t('data.notice.recordLoaded', {date: fmtDate(record.date)}));
      window.scrollTo({top: 0, behavior: 'smooth'});
    },
    [t],
  );

  /** Prefill the form from the latest record (quick update flow). */
  const useLatest = useCallback(() => {
    if (!latest) return;
    loadRecord(latest);
    setNotice(null);
  }, [latest, loadRecord]);

  // External signal: "start a new measurement" (from Progress' CTA).
  useEffect(() => {
    if (newMeasurementSignal > 0) clearBioForm();
  }, [newMeasurementSignal, clearBioForm]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({...f, [key]: value}));
  const setBio = (key: BioNumKey, value: Num) =>
    setForm((f) => ({...f, bio: {...f.bio, [key]: value}}));

  const basicValid =
    form.age !== '' &&
    form.age > 0 &&
    form.height !== '' &&
    form.height > 0 &&
    form.initialWeight !== '' &&
    form.initialWeight > 0;

  /** Live preview of the calculations, using the form values. */
  const previewTargets = useMemo(() => {
    if (!basicValid) return null;
    return computeTargets(
      {
        sex: form.sex,
        age: Number(form.age),
        heightCm: Number(form.height),
        weightKg: Number(form.bio.weight !== '' ? form.bio.weight : form.initialWeight),
        goal: form.goal,
        exercise: {
          active: form.exerciseActive,
          frequency: form.exerciseActive ? form.frequency : 'none',
          intensity: form.intensity,
          type: form.type,
        },
      },
      coreT,
    );
  }, [basicValid, form]);

  const hasBioData = useMemo(
    () => BIO_KEYS.some((k) => form.bio[k] !== ''),
    [form.bio],
  );

  const handleSave = () => {
    if (!basicValid) {
      setNotice(t('data.notice.invalidProfile'));
      return;
    }
    const nextProfile: Profile = {
      name: form.name.trim(),
      sex: form.sex,
      age: Number(form.age),
      height: Number(form.height),
      initialWeight: Number(form.initialWeight),
      goal: form.goal,
      country: form.country,
      supplements: form.supplements,
      exercise: {
        active: form.exerciseActive,
        frequency: form.exerciseActive ? form.frequency : 'none',
        intensity: form.intensity,
        type: form.type,
        workoutTime: form.exerciseActive ? form.workoutTime : '',
      },
      // Kept from the stored profile: editable in Definições (diet preferences).
      excludedFoods: profile?.excludedFoods ?? '',
      observations: profile?.observations ?? '',
      updatedAt: Date.now(),
    };
    saveProfile(nextProfile);

    if (hasBioData) {
      const record: BioRecord = {date: form.bioDate};
      BIO_KEYS.forEach((k) => {
        const v = form.bio[k];
        if (v !== '') record[k] = Number(v);
      });
      saveBioRecord(record);
    }
    setAskGenerate(true);
  };

  // Feedback (loading overlay + success/error toast) is global — see
  // GenerationFeedback. Here we just close the dialog and run the generation.
  const doGenerate = async () => {
    setAskGenerate(false);
    await generatePlan();
  };

  const skipGenerate = () => {
    setAskGenerate(false);
    setNotice(t('data.notice.savedKeep'));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
      <header
        className="flex items-start justify-between"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t('data.title')}</h1>
          <p className="text-sm text-slate-400">{t('data.subtitle')}</p>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label={t('common.settings')}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <GearIcon size={22} />
        </button>
      </header>

      {notice ? (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckIcon size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="ml-auto text-emerald-500"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="mt-4 md:grid md:grid-cols-2 md:items-start md:gap-4">
      {/* Calculation summary */}
      {previewTargets ? (
        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2 md:mb-0">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">{t('data.calcSummary')}</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-400">{t('data.bmrMifflin')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.bmrMifflin, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('data.bmrHarris')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.bmrHarrisBenedict, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('data.tdee')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.tdee, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">
                {t('data.calorieRange', {goal: t(GOAL_LABEL_KEYS[form.goal])})}
              </dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.calorieMin, 0)}–{fmt(previewTargets.calorieMax, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('data.protein')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.proteinG, 0)} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('data.carbs')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.carbsG, 0)} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('data.fat')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.fatG, 0)} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('data.satFatMax')}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {'< '}{fmt(previewTargets.saturatedFatLimitG, 0)} g
              </dd>
            </div>
          </dl>
          {currentTargets ? (
            <p className="mt-3 border-t border-slate-50 pt-2 text-[11px] text-slate-400">
              {t('data.currentPlanNote', {kcal: fmt(currentTargets.calorieTarget, 0)})}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Profile form */}
      <section className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mt-0">
        <h2 className="text-sm font-semibold text-slate-700">{t('data.profile')}</h2>
        <Field label={t('data.name')}>
          <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label={t('data.sex')}>
          <ChipGroup options={sexOptions} value={form.sex} onChange={(v) => set('sex', v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('data.age')}>
            <NumberInput value={form.age} onChange={(v) => set('age', v)} />
          </Field>
          <Field label={t('data.height')}>
            <NumberInput value={form.height} onChange={(v) => set('height', v)} />
          </Field>
        </div>
        <Field label={t('data.initialWeight')} hint={t('data.initialWeightHint')}>
          <NumberInput value={form.initialWeight} onChange={(v) => set('initialWeight', v)} />
        </Field>
        <Field label={t('data.country')} hint={t('data.countryHint')}>
          <Select
            options={countryOpts}
            value={form.country}
            onChange={(e) => set('country', e.target.value as CountryCode)}
          />
        </Field>
        <div className="space-y-3 rounded-2xl border border-slate-100 p-3.5">
          <p className="text-sm font-medium text-slate-700">{t('data.supplements')}</p>
          <Checkbox
            label={t('data.supplementsWhey')}
            checked={form.supplements.wheyProtein}
            onChange={(v) => set('supplements', {...form.supplements, wheyProtein: v})}
          />
          <Checkbox
            label={t('data.supplementsCreatine')}
            checked={form.supplements.creatine}
            onChange={(v) => set('supplements', {...form.supplements, creatine: v})}
          />
          <p className="text-xs text-slate-400">{t('data.supplementsHint')}</p>
        </div>
      </section>

      {/* Goal + exercise */}
      <section className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mt-0">
        <h2 className="text-sm font-semibold text-slate-700">{t('data.goalExercise')}</h2>
        <Field label={t('data.goal')}>
          <ChipGroup options={goalOptions} value={form.goal} onChange={(v) => set('goal', v)} />
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">{t('data.exerciseQuestion')}</span>
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
              onClick={() => set('exerciseActive', true)}
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
          <>
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
            <Field label={t('data.workoutTime')} hint={t('data.workoutTimeHint')}>
              <input
                type="time"
                value={form.workoutTime}
                onChange={(e) => set('workoutTime', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </Field>
          </>
        ) : null}
      </section>

      {/* Bioimpedance */}
      <section className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2 md:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">{t('data.bioimpedance')}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{t('data.bioHint')}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={clearBioForm}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300"
            >
              {t('data.newMeasurement')}
            </button>
            <button
              type="button"
              onClick={useLatest}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300"
            >
              {t('data.useLatest')}
            </button>
          </div>
        </div>
        <Field label={t('data.measurementDate')}>
          <input
            type="date"
            value={form.bioDate}
            onChange={(e) => set('bioDate', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {BIO_KEYS.map((k) => (
            <Field key={k} label={t(BIO_LABEL_KEYS[k])}>
              <NumberInput value={form.bio[k]} onChange={(v) => setBio(k, v)} placeholder="—" />
            </Field>
          ))}
        </div>

        {/* History list */}
        {biometrics.history.length > 0 ? (
          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('data.recordedMeasurements', {count: biometrics.history.length})}
            </h3>
            <div className="space-y-2">
              {[...biometrics.history].reverse().map((r) => (
                <div
                  key={r.date}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700">{fmtDate(r.date)}</p>
                    <p className="truncate text-xs text-slate-400">
                      {r.weight !== undefined ? `${fmt(r.weight, 1)} kg` : ''}
                      {r.bodyFat !== undefined ? ` · ${fmt(r.bodyFat, 1)}% ${t('metric.bodyFat')}` : ''}
                      {r.bmi !== undefined ? ` · ${t('metric.bmi')} ${fmt(r.bmi, 1)}` : ''}
                      {r.muscle !== undefined ? ` · ${fmt(r.muscle, 1)} kg ${t('metric.muscle')}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => loadRecord(r)}
                      aria-label={t('data.editMeasurement', {date: fmtDate(r.date)})}
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-emerald-600"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteDate(r.date)}
                      aria-label={t('data.deleteMeasurement', {date: fmtDate(r.date)})}
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rose-600"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-400">
            {t('data.noMeasurements')}
          </p>
        )}
      </section>
      </div>

      <div className="mx-auto mt-5 max-w-md">
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700"
        >
          <SparklesIcon size={16} />
          {t('common.save')}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">{t('data.saveNote')}</p>
      </div>

      <ConfirmDialog
        open={askGenerate}
        title={t('data.askGenerate.title')}
        message={
          <>
            {t('data.askGenerate.body')}
            <span className="mt-2 block text-xs text-slate-400">
              {t('data.askGenerate.note')}
            </span>
          </>
        }
        confirmLabel={t('data.askGenerate.confirm')}
        cancelLabel={t('data.askGenerate.cancel')}
        onConfirm={doGenerate}
        onCancel={skipGenerate}
      />

      <ConfirmDialog
        open={deleteDate !== null}
        title={t('data.deleteAsk.title')}
        message={deleteDate ? t('data.deleteAsk.message', {date: fmtDate(deleteDate)}) : ''}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={() => {
          if (deleteDate) {
            removeBioRecord(deleteDate);
            setNotice(t('data.notice.deleted'));
          }
          setDeleteDate(null);
        }}
        onCancel={() => setDeleteDate(null)}
      />
    </div>
  );
}
