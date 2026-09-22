// "Progress" screen: history charts (Chart.js) + list of bioimpedance records.

import {useMemo, useState} from 'react';

import {ChartBlock} from '../components/ChartBlock';
import {GearIcon, ScaleIcon} from '../components/icons';
import {useStore} from '../hooks/useStore';
import {fmt, fmtDate} from '../lib/units';
import type {BioRecord} from '../types';

type MetricKey = 'weight' | 'bodyFat' | 'bmi' | 'muscle' | 'water' | 'protein';

interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
}

const METRICS: MetricDef[] = [
  {key: 'weight', label: 'Peso', unit: 'kg', color: '#059669'},
  {key: 'bodyFat', label: 'Gordura corporal', unit: '%', color: '#e11d48'},
  {key: 'bmi', label: 'IMC', unit: '', color: '#0284c7'},
  {key: 'muscle', label: 'Músculo', unit: 'kg', color: '#d97706'},
  {key: 'water', label: 'Água', unit: '%', color: '#2563eb'},
  {key: 'protein', label: 'Proteína', unit: '%', color: '#7c3aed'},
];

const METRIC_MAP = new Map(METRICS.map((m) => [m.key, m]));

export function Progress({
  onAddMeasurement,
  onOpenSettings,
}: {
  onAddMeasurement: () => void;
  onOpenSettings: () => void;
}) {
  const {biometrics} = useStore();
  const [metricKey, setMetricKey] = useState<MetricKey>('weight');

  const history = useMemo(() => [...biometrics.history].reverse(), [biometrics.history]);
  const metric = METRIC_MAP.get(metricKey)!;

  const points = useMemo(
    () =>
      history
        .filter((r) => r[metric.key] !== undefined && r[metric.key] !== null)
        .reverse() as unknown as Array<BioRecord & Record<MetricKey, number>>,
    [history, metric.key],
  );

  const labels = points.map((r) =>
    new Date(r.date + 'T12:00:00').toLocaleDateString('pt-PT', {day: '2-digit', month: 'short'}),
  );
  const values = points.map((r) => Number(r[metric.key]));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
      <header
        className="flex items-start justify-between"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Progresso</h1>
          <p className="text-sm text-slate-400">{history.length} medições registadas</p>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Definições"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <GearIcon size={22} />
        </button>
      </header>

      {/* Metric selector */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetricKey(m.key)}
            className={
              'shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ' +
              (m.key === metricKey
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600')
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-8 md:mt-4 md:grid md:grid-cols-3 md:items-start md:gap-4">
        {points.length < 2 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm md:col-span-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ScaleIcon size={24} />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {points.length === 0 ? 'Ainda sem dados' : 'Precisas de mais medições'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {points.length === 0
                ? 'Regista a tua primeira medição da balança de bioimpedância para veres a evolução.'
                : 'Com pelo menos duas medições, o gráfico mostra a tua evolução.'}
            </p>
            <button
              onClick={onAddMeasurement}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm active:bg-emerald-700"
            >
              Registrar medição
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:col-span-2">
            <ChartBlock
              labels={labels}
              values={values}
              label={metric.label}
              color={metric.color}
              unit={metric.unit}
            />
            <div className="mt-2 flex items-baseline justify-between border-t border-slate-50 pt-3">
              <span className="text-xs text-slate-400">Última medição</span>
              <span className="text-lg font-bold tabular-nums text-slate-800">
                {fmt(values[values.length - 1], 1)} {metric.unit}
              </span>
            </div>
          </div>
        )}

        {/* Latest summary chips */}
        {biometrics.latest ? (
          <div className="mt-4 grid grid-cols-3 gap-2 md:col-span-1 md:mt-0 md:grid-cols-1">
            {METRICS.filter((m) => biometrics.latest?.[m.key] !== undefined).map((m) => (
              <div key={m.key} className="rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                <p className="text-[11px] text-slate-400">{m.label}</p>
                <p className="text-sm font-bold tabular-nums text-slate-800">
                  {fmt(biometrics.latest?.[m.key], 1)} {m.unit}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* History list */}
      {history.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Histórico
          </h2>
          <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
            {history.map((r) => (
              <div
                key={r.date}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-700">{fmtDate(r.date)}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {r.weight !== undefined ? <span>Peso {fmt(r.weight, 1)} kg</span> : null}
                  {r.bodyFat !== undefined ? <span>Gordura {fmt(r.bodyFat, 1)}%</span> : null}
                  {r.bmi !== undefined ? <span>IMC {fmt(r.bmi, 1)}</span> : null}
                  {r.muscle !== undefined ? <span>Músculo {fmt(r.muscle, 1)} kg</span> : null}
                  {r.water !== undefined ? <span>Água {fmt(r.water, 1)}%</span> : null}
                  {r.visceralFat !== undefined ? (
                    <span>Visceral {fmt(r.visceralFat, 1)}</span>
                  ) : null}
                  {r.bmr !== undefined ? <span>Basal {fmt(r.bmr, 0)} kcal</span> : null}
                  {r.bodyAge !== undefined ? <span>Idade corp. {fmt(r.bodyAge, 0)}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
