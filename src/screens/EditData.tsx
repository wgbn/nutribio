// "Data" screen: single form with profile, goal/exercise and bioimpedance.
// Saving a bioimpedance record adds it to the history (dedupe by date).
// Saving asks whether to regenerate the plan (confirm dialog).

import {useCallback, useEffect, useMemo, useState} from 'react';

import {ChipGroup, Field, NumberInput, Select, TextInput} from '../components/Field';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {CheckIcon, GearIcon, PencilIcon, SparklesIcon, TrashIcon} from '../components/icons';
import {useStore} from '../hooks/useStore';
import {
  computeTargets,
  EXERCISE_TYPE_LABELS,
  FREQUENCY_LABELS,
  GOAL_LABELS,
  INTENSITY_LABELS,
  SEX_LABELS,
} from '../lib/calculations';
import {todayKey} from '../lib/mealTimes';
import {fmt, fmtDate} from '../lib/units';
import type {
  BioRecord,
  ExerciseFrequency,
  ExerciseIntensity,
  ExerciseType,
  Goal,
  Profile,
  Sex,
} from '../types';

const GOAL_OPTIONS = (Object.keys(GOAL_LABELS) as Goal[]).map((g) => ({value: g, label: GOAL_LABELS[g]}));
const SEX_OPTIONS = (Object.keys(SEX_LABELS) as Sex[]).map((s) => ({value: s, label: SEX_LABELS[s]}));
const FREQ_OPTIONS = (Object.keys(FREQUENCY_LABELS) as ExerciseFrequency[]).map((f) => ({
  value: f,
  label: FREQUENCY_LABELS[f],
}));
const INTENSITY_OPTIONS = (Object.keys(INTENSITY_LABELS) as ExerciseIntensity[]).map((i) => ({
  value: i,
  label: INTENSITY_LABELS[i],
}));
const TYPE_OPTIONS = (Object.keys(EXERCISE_TYPE_LABELS) as ExerciseType[]).map((t) => ({
  value: t,
  label: EXERCISE_TYPE_LABELS[t],
}));

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
  exerciseActive: boolean;
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  type: ExerciseType;
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

const BIO_LABELS: Record<BioNumKey, string> = {
  weight: 'Peso atual (kg)',
  bodyFat: 'Gordura corporal (%)',
  water: 'Água (%)',
  bmr: 'Metabolismo basal (kcal)',
  visceralFat: 'Gordura visceral',
  bmi: 'IMC',
  muscle: 'Músculo (kg)',
  protein: 'Proteína (%)',
  boneMass: 'Massa óssea (kg)',
  bodyAge: 'Idade corporal',
  idealWeight: 'Peso ideal (kg)',
};

export function EditData({
  onOpenSettings,
  newMeasurementSignal = 0,
}: {
  onOpenSettings: () => void;
  /** Increment to start a fresh bioimpedance form (used by Progress' CTA). */
  newMeasurementSignal?: number;
}) {
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
    exerciseActive: profile?.exercise.active ?? false,
    frequency: profile?.exercise.frequency ?? 'none',
    intensity: profile?.exercise.intensity ?? 'moderate',
    type: profile?.exercise.type ?? 'mixed',
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
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

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
  const loadRecord = useCallback((record: BioRecord) => {
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
    setNotice(`Medição de ${fmtDate(record.date)} carregada — altera e guarda para atualizar essa data.`);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

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
    form.name.trim().length > 0 &&
    form.age !== '' &&
    form.age > 0 &&
    form.height !== '' &&
    form.height > 0 &&
    form.initialWeight !== '' &&
    form.initialWeight > 0;

  /** Live preview of the calculations, using the form values. */
  const previewTargets = useMemo(() => {
    if (!basicValid) return null;
    return computeTargets({
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
    });
  }, [basicValid, form]);

  const hasBioData = useMemo(
    () => BIO_KEYS.some((k) => form.bio[k] !== ''),
    [form.bio],
  );

  const handleSave = () => {
    if (!basicValid) {
      setNotice('Preenche os campos obrigatórios do perfil antes de guardar.');
      return;
    }
    const nextProfile: Profile = {
      name: form.name.trim(),
      sex: form.sex,
      age: Number(form.age),
      height: Number(form.height),
      initialWeight: Number(form.initialWeight),
      goal: form.goal,
      exercise: {
        active: form.exerciseActive,
        frequency: form.exerciseActive ? form.frequency : 'none',
        intensity: form.intensity,
        type: form.type,
      },
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

  const doGenerate = async () => {
    setGenerating(true);
    const ok = await generatePlan();
    setGenerating(false);
    setAskGenerate(false);
    setNotice(
      ok
        ? 'Plano gerado com sucesso!'
        : 'Dados guardados, mas não foi possível gerar o plano. Verifica a chave da API nas Definições.',
    );
  };

  const skipGenerate = () => {
    setAskGenerate(false);
    setNotice('Dados guardados. O plano atual mantém-se.');
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
      <header
        className="flex items-start justify-between"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Os teus dados</h1>
          <p className="text-sm text-slate-400">
            Guarda tudo num só sítio. Tudo fica apenas neste dispositivo.
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Definições"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <GearIcon size={22} />
        </button>
      </header>

      {notice ? (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckIcon size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="ml-auto text-emerald-500" aria-label="Fechar">
            ✕
          </button>
        </div>
      ) : null}

      <div className="mt-4 md:grid md:grid-cols-2 md:items-start md:gap-4">
      {/* Calculation summary */}
      {previewTargets ? (
        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2 md:mb-0">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Resumo dos cálculos</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-400">TMB Mifflin-St Jeor</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.bmrMifflin, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">TMB Harris-Benedict</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.bmrHarrisBenedict, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Gasto total diário (TDEE)</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.tdee, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Faixa calórica ({GOAL_LABELS[form.goal]})</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.calorieMin, 0)}–{fmt(previewTargets.calorieMax, 0)} kcal
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Proteína</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.proteinG, 0)} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Hidratos</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.carbsG, 0)} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Gordura</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {fmt(previewTargets.fatG, 0)} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Gordura saturada (máx.)</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                &lt; {fmt(previewTargets.saturatedFatLimitG, 0)} g
              </dd>
            </div>
          </dl>
          {currentTargets ? (
            <p className="mt-3 border-t border-slate-50 pt-2 text-[11px] text-slate-400">
              Plano atual gerado para {fmt(currentTargets.calorieTarget, 0)} kcal/dia. Estes valores
              passam a valer quando gerares um novo plano.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Profile form */}
      <section className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mt-0">
        <h2 className="text-sm font-semibold text-slate-700">Perfil</h2>
        <Field label="Nome">
          <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Sexo">
          <ChipGroup options={SEX_OPTIONS} value={form.sex} onChange={(v) => set('sex', v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Idade (anos)">
            <NumberInput value={form.age} onChange={(v) => set('age', v)} />
          </Field>
          <Field label="Altura (cm)">
            <NumberInput value={form.height} onChange={(v) => set('height', v)} />
          </Field>
        </div>
        <Field label="Peso inicial (kg)" hint="Usado como referência quando não há medição recente.">
          <NumberInput value={form.initialWeight} onChange={(v) => set('initialWeight', v)} />
        </Field>
      </section>

      {/* Goal + exercise */}
      <section className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mt-0">
        <h2 className="text-sm font-semibold text-slate-700">Objetivo e exercício</h2>
        <Field label="Objetivo">
          <ChipGroup options={GOAL_OPTIONS} value={form.goal} onChange={(v) => set('goal', v)} />
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Praticas exercício físico?</span>
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
              Não
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
              Sim
            </button>
          </div>
        </div>
        {form.exerciseActive ? (
          <>
            <Field label="Frequência">
              <ChipGroup
                options={FREQ_OPTIONS.filter((o) => o.value !== 'none')}
                value={form.frequency}
                onChange={(v) => set('frequency', v)}
              />
            </Field>
            <Field label="Intensidade">
              <ChipGroup
                options={INTENSITY_OPTIONS}
                value={form.intensity}
                onChange={(v) => set('intensity', v)}
              />
            </Field>
            <Field label="Tipo de treino">
              <Select
                options={TYPE_OPTIONS}
                value={form.type}
                onChange={(e) => set('type', e.target.value as ExerciseType)}
              />
            </Field>
          </>
        ) : null}
      </section>

      {/* Bioimpedance */}
      <section className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2 md:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Bioimpedância</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Ao guardar, a medição é adicionada ao histórico com a data escolhida. Se a data já
              estiver registada, essa medição é substituída.
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={clearBioForm}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300"
            >
              Nova medição
            </button>
            <button
              type="button"
              onClick={useLatest}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300"
            >
              Usar última medição
            </button>
          </div>
        </div>
        <Field label="Data da medição">
          <input
            type="date"
            value={form.bioDate}
            onChange={(e) => set('bioDate', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {BIO_KEYS.map((k) => (
            <Field key={k} label={BIO_LABELS[k]}>
              <NumberInput value={form.bio[k]} onChange={(v) => setBio(k, v)} placeholder="—" />
            </Field>
          ))}
        </div>

        {/* History list */}
        {biometrics.history.length > 0 ? (
          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Medições registadas ({biometrics.history.length})
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
                      {r.bodyFat !== undefined ? ` · ${fmt(r.bodyFat, 1)}% gordura` : ''}
                      {r.bmi !== undefined ? ` · IMC ${fmt(r.bmi, 1)}` : ''}
                      {r.muscle !== undefined ? ` · ${fmt(r.muscle, 1)} kg músculo` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => loadRecord(r)}
                      aria-label={`Editar medição de ${fmtDate(r.date)}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-emerald-600"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteDate(r.date)}
                      aria-label={`Apagar medição de ${fmtDate(r.date)}`}
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
            Ainda não registaste nenhuma medição de bioimpedância.
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
          Guardar
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Ao guardar, podes optar por gerar um novo plano alimentar.
        </p>
      </div>

      <ConfirmDialog
        open={askGenerate}
        title="Gerar novo plano agora?"
        message={
          <>
            Os teus dados foram guardados. Queres gerar um novo plano alimentar semanal com o Gemini
            com base nos dados atualizados?
            <span className="mt-2 block text-xs text-slate-400">
              Se preferires, o plano atual mantém-se até gerares um novo.
            </span>
          </>
        }
        confirmLabel="Sim, gerar plano"
        cancelLabel="Só guardar"
        busy={generating}
        onConfirm={doGenerate}
        onCancel={skipGenerate}
      />

      <ConfirmDialog
        open={deleteDate !== null}
        title="Apagar esta medição?"
        message={
          deleteDate
            ? `A medição de ${fmtDate(deleteDate)} será removida do histórico. O plano atual não é alterado.`
            : ''
        }
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deleteDate) {
            removeBioRecord(deleteDate);
            setNotice('Medição apagada do histórico.');
          }
          setDeleteDate(null);
        }}
        onCancel={() => setDeleteDate(null)}
      />
    </div>
  );
}
