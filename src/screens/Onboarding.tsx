// First-run wizard: welcome + basic profile + optional bioimpedance step.
// Saves locally and offers to generate the first plan.

import {useMemo, useState} from 'react';

import {ChipGroup, Field, NumberInput, Select, TextInput} from '../components/Field';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {LeafIcon, SparklesIcon} from '../components/icons';
import {useStore} from '../hooks/useStore';
import {
  EXERCISE_TYPE_LABELS,
  FREQUENCY_LABELS,
  GOAL_LABELS,
  INTENSITY_LABELS,
  SEX_LABELS,
} from '../lib/calculations';
import {todayKey} from '../lib/mealTimes';
import type {BioRecord, ExerciseFrequency, ExerciseIntensity, ExerciseType, Goal, Sex} from '../types';

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

interface FormState {
  name: string;
  sex: Sex;
  age: number | '';
  height: number | '';
  weight: number | '';
  goal: Goal;
  exerciseActive: boolean;
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  type: ExerciseType;
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

const BIO_FIELDS: Array<{key: keyof FormState['bio']; label: string; hint?: string}> = [
  {key: 'weight', label: 'Peso atual (kg)'},
  {key: 'bodyFat', label: 'Gordura corporal (%)'},
  {key: 'water', label: 'Água (%)'},
  {key: 'bmr', label: 'Metabolismo basal (kcal)'},
  {key: 'visceralFat', label: 'Gordura visceral'},
  {key: 'bmi', label: 'IMC'},
  {key: 'muscle', label: 'Músculo (kg)'},
  {key: 'protein', label: 'Proteína (%)'},
  {key: 'boneMass', label: 'Massa óssea (kg)'},
  {key: 'bodyAge', label: 'Idade corporal'},
  {key: 'idealWeight', label: 'Peso ideal (kg)'},
];

export function Onboarding({onDone}: {onDone: () => void}) {
  const {saveProfile, saveBioRecord, generatePlan} = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: '',
    sex: 'male',
    age: '',
    height: '',
    weight: '',
    goal: 'lose_fat',
    exerciseActive: false,
    frequency: 'none',
    intensity: 'moderate',
    type: 'mixed',
    bio: emptyBio,
  });
  const [error, setError] = useState<string | null>(null);
  const [askGenerate, setAskGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);

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
    setError(null);
    if (!basicValid) return;
    saveProfile({
      name: form.name.trim(),
      sex: form.sex,
      age: Number(form.age),
      height: Number(form.height),
      initialWeight: Number(form.weight),
      goal: form.goal,
      exercise: {
        active: form.exerciseActive,
        frequency: form.exerciseActive ? form.frequency : 'none',
        intensity: form.intensity,
        type: form.type,
      },
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

  const doGenerate = async () => {
    setGenerating(true);
    const ok = await generatePlan();
    setGenerating(false);
    setAskGenerate(false);
    if (ok) onDone();
    else setError(
      'Não foi possível gerar o plano. Verifica se adicionaste a chave da API Gemini nas Definições.',
    );
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
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Vamos começar</h1>
              <p className="mt-1 text-sm text-slate-500">
                Primeiro, conta-nos quem és e qual é o teu objetivo. Os dados ficam só no teu
                dispositivo.
              </p>
            </div>

            <Field label="Como te chamas?">
              <TextInput
                placeholder="O teu nome"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>

            <Field label="Sexo">
              <ChipGroup options={SEX_OPTIONS} value={form.sex} onChange={(v) => set('sex', v)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Idade (anos)">
                <NumberInput value={form.age} onChange={(v) => set('age', v)} placeholder="ex.: 35" />
              </Field>
              <Field label="Altura (cm)">
                <NumberInput value={form.height} onChange={(v) => set('height', v)} placeholder="ex.: 175" />
              </Field>
            </div>

            <Field label="Peso inicial (kg)">
              <NumberInput value={form.weight} onChange={(v) => set('weight', v)} placeholder="ex.: 78,5" />
            </Field>

            <Field label="Objetivo">
              <ChipGroup options={GOAL_OPTIONS} value={form.goal} onChange={(v) => set('goal', v)} />
            </Field>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
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
                    Sim
                  </button>
                </div>
              </div>
              {form.exerciseActive ? (
                <div className="space-y-4">
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
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Sem exercício, o cálculo usa um fator de atividade sedentário.
                </p>
              )}
            </div>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            ) : null}

            <button
              onClick={() => setStep(1)}
              disabled={!basicValid}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700 disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dados da balança</h1>
              <p className="mt-1 text-sm text-slate-500">
                Se já tens uma medição de bioimpedância, regista-a. Este passo é opcional — podes
                saltá-lo e adicionar os dados mais tarde no separador «Dados».
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BIO_FIELDS.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  <NumberInput
                    value={form.bio[f.key]}
                    onChange={(v) => setBio(f.key, v)}
                    placeholder="—"
                  />
                </Field>
              ))}
            </div>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            ) : null}

            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(0)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600 active:bg-slate-50"
              >
                Voltar
              </button>
              <button
                onClick={commitAndMaybeGenerate}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700"
              >
                <SparklesIcon size={16} />
                Concluir
              </button>
            </div>
            <button
              onClick={commitAndMaybeGenerate}
              className="w-full text-center text-sm text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              Saltar este passo (opcional)
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={askGenerate}
        title="Gerar o plano agora?"
        message="Os teus dados foram guardados. Queres que o Nutribio gere o teu plano alimentar semanal com o Gemini agora? (Também podes gerar mais tarde.)"
        confirmLabel="Sim, gerar plano"
        cancelLabel="Mais tarde"
        busy={generating}
        onConfirm={doGenerate}
        onCancel={skipGenerate}
      />
    </div>
  );
}
