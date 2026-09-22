// "Plan" screen: full week view with per-day meal cards and variation pickers.

import {useState} from 'react';

import {GearIcon, SparklesIcon} from '../components/icons';
import {MacroBar} from '../components/MacroBar';
import {MealCard} from '../components/MealCard';
import {useStore} from '../hooks/useStore';
import {fmtDateTime} from '../lib/units';
import {WEEKDAY_LABELS, WEEK_ORDER} from '../lib/mealTimes';
import {dayTotals, getSelectedDish} from '../lib/plan';
import type {WeekDayId} from '../types';

const DAY_KEYS = [...WEEK_ORDER] as WeekDayId[];

/** Monday-first index of a date's weekday (0 = Monday … 6 = Sunday). */
function weekdayIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export function Plan({onOpenSettings}: {onOpenSettings: () => void}) {
  const {plan, targets, setSelectedVariation, generatePlan, isGenerating, generationStage} =
    useStore();
  const todayDow = WEEK_ORDER[weekdayIndex(new Date())];
  const [selectedDay, setSelectedDay] = useState<WeekDayId>(todayDow);

  const dayPlan = plan?.week.find((d) => d.day === selectedDay);

  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6 md:pb-12">
        <div className="mt-16 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Sem plano gerado</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gera o teu plano semanal para veres as refeições de todos os dias.
          </p>
          {isGenerating ? (
            <p className="mt-4 text-sm font-medium text-emerald-600">
              {generationStage ?? 'A gerar…'}
            </p>
          ) : (
            <button
              onClick={() => void generatePlan()}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm active:bg-emerald-700"
            >
              <SparklesIcon size={16} />
              Gerar plano semanal
            </button>
          )}
        </div>
      </div>
    );
  }

  const totals = dayPlan ? dayTotals(dayPlan) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
      <header
        className="flex items-start justify-between"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Plano semanal</h1>
          <p className="text-sm text-slate-400">
            Gerado a {fmtDateTime(plan.generatedAt)} · {plan.week.length} dias
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

      {plan.overview ? (
        <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
          {plan.overview}
        </p>
      ) : null}

      {/* Day selector */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {DAY_KEYS.map((d) => {
          const active = d === selectedDay;
          const isToday = d === todayDow;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ' +
                (active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600')
              }
            >
              {WEEKDAY_LABELS[d]}
              {isToday ? ' · hoje' : ''}
            </button>
          );
        })}
      </div>

      {dayPlan ? (
        <>
          <div className="mt-4 md:grid md:grid-cols-3 md:items-start md:gap-4">
          {/* Daily totals vs targets */}
          {targets && totals ? (
            <section className="mb-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mb-0">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                Totais de {WEEKDAY_LABELS[selectedDay].toLowerCase()} vs alvo
              </h2>
              <div className="space-y-3">
                <MacroBar
                  label="Calorias"
                  value={totals.kcal}
                  target={targets.calorieTarget}
                  unit="kcal"
                  color="bg-emerald-500"
                />
                <MacroBar
                  label="Proteína"
                  value={totals.protein}
                  target={targets.proteinG}
                  unit="g"
                  color="bg-sky-500"
                />
                <MacroBar
                  label="Hidratos"
                  value={totals.carbs}
                  target={targets.carbsG}
                  unit="g"
                  color="bg-amber-500"
                />
                <MacroBar
                  label="Gordura"
                  value={totals.fat}
                  target={targets.fatG}
                  unit="g"
                  color="bg-rose-500"
                />
              </div>
            </section>
          ) : null}

          {/* Meals */}
          <section className="space-y-2.5 md:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-2.5">
              {dayPlan.meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  showPicker
                  onPick={(i) => setSelectedVariation(selectedDay, meal.id, i)}
                />
              ))}
            </div>
          </section>
          </div>

          {/* Quick preview of the other days */}
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Outros dias
            </h2>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {DAY_KEYS.filter((d) => d !== selectedDay).map((d) => {
                const dp = plan.week.find((x) => x.day === d);
                if (!dp) return null;
                const previews = dp.meals
                  .map((m) => getSelectedDish(m)?.name)
                  .filter((n): n is string => !!n);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm active:bg-slate-50"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {WEEKDAY_LABELS[d]}
                    </span>
                    <span className="ml-3 truncate text-xs text-slate-400">
                      {previews.length > 0 ? previews.join(' · ') : 'Sem sugestões'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <p className="mt-10 text-center text-sm text-slate-400">
          Este dia ainda não tem refeições geradas.
        </p>
      )}
    </div>
  );
}
