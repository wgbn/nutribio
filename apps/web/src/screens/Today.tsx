// "Today" screen: the meal of the moment with dish variations (swipe/arrows),
// upcoming meals and daily macro progress.

import {useRef} from 'react';
import {useTranslation} from 'react-i18next';

import {
  currentMealSlot,
  dayTotals,
  getSelectedDish,
  nextMeals,
  startsInLabel,
  timeWindowLabel,
  todayKey,
  workoutBadgeFor,
  type WeekDayId,
} from '@nutribio/core';

import {DishSwitcher} from '../components/DishSwitcher';
import {GeneratePlanButton} from '../components/GeneratePlanButton';
import {GearIcon, RestaurantIcon, SparklesIcon} from '../components/icons';
import {MacroBar} from '../components/MacroBar';
import {MacroChips} from '../components/MealCard';
import {useStore} from '../hooks/useStore';
import {coreT} from '../i18n/translate';
import {fmt, fmtDate} from '../lib/units';

const WEEKDAY_MAP: WeekDayId[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function Today({
  onNavigate,
  onOpenSettings,
}: {
  onNavigate: (tab: 'today' | 'plan' | 'progress' | 'data') => void;
  onOpenSettings: () => void;
}) {
  const {t} = useTranslation();
  const {
    profile,
    plan,
    targets,
    workoutMeals,
    planIsCurrent,
    isGenerating,
    setSelectedVariation,
  } = useStore();
  const touchX = useRef<number | null>(null);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return t('greeting.early');
    if (h < 12) return t('greeting.morning');
    if (h < 20) return t('greeting.afternoon');
    return t('greeting.evening');
  })();

  const today = WEEKDAY_MAP[new Date().getDay()];
  const todayPlan = plan?.week.find((d) => d.day === today);
  const current = currentMealSlot();
  const currentMeal = todayPlan?.meals.find((m) => m.id === current?.id);
  const upcoming = nextMeals();
  const todayTotals = todayPlan ? dayTotals(todayPlan) : {kcal: 0, protein: 0, carbs: 0, fat: 0};

  const dish = currentMeal ? getSelectedDish(currentMeal) : null;

  const onSwipeEnd = (deltaX: number) => {
    if (!currentMeal || currentMeal.variations.length < 2) return;
    if (Math.abs(deltaX) < 40) return;
    const next =
      deltaX < 0
        ? (currentMeal.selectedIndex + 1) % currentMeal.variations.length
        : (currentMeal.selectedIndex - 1 + currentMeal.variations.length) %
          currentMeal.variations.length;
    setSelectedVariation(today, currentMeal.id, next);
  };

  const busy = isGenerating;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
      {/* Header */}
      <header
        className="mb-4 flex items-start justify-between"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {greeting}
            {profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-slate-400 capitalize">{fmtDate(todayKey())}</p>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label={t('common.settings')}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <GearIcon size={22} />
        </button>
      </header>

      {/* Stale plan banner */}
      {plan && !planIsCurrent && !busy ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">{t('today.stale.title')}</p>
          <p className="mt-0.5 text-amber-700">{t('today.stale.body')}</p>
          <GeneratePlanButton
            label={t('today.stale.cta')}
            variant="warning"
            icon={<SparklesIcon size={14} />}
            className="mt-2.5 text-xs"
          />        </div>
      ) : null}

      {/* No plan */}
      {!plan ? (
        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <RestaurantIcon size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{t('today.empty.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('today.empty.body')}</p>
          <GeneratePlanButton
            label={t('today.empty.cta')}
            icon={<SparklesIcon size={16} />}
            className="mt-5 w-full py-3"
          />
        </div>
      ) : (
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-4 xl:grid-cols-3">
          {/* Current meal */}
          {current && currentMeal && dish ? (
            <section className="mb-5 xl:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      {t('today.now')} · {currentMeal.label}
                    </h2>
                    {workoutBadgeFor(currentMeal.id, workoutMeals) ? (
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ' +
                          (workoutBadgeFor(currentMeal.id, workoutMeals) === 'pre'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-sky-100 text-sky-700')
                        }
                      >
                        {t(`badge.${workoutBadgeFor(currentMeal.id, workoutMeals)}`)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-400">{currentMeal.timeWindow}</p>
                </div>
                {dish.macros ? <MacroChips macros={dish.macros} /> : null}
              </div>
              <div
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                onTouchStart={(e) => {
                  touchX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchX.current !== null) {
                    onSwipeEnd(e.changedTouches[0].clientX - touchX.current);
                    touchX.current = null;
                  }
                }}
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-slate-800">{dish.name}</h3>
                  {dish.description ? (
                    <p className="text-sm text-slate-500">{dish.description}</p>
                  ) : null}
                </div>
                <ul className="mb-4 divide-y divide-slate-50 rounded-2xl bg-slate-50/60 px-3.5">
                  {dish.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                      <span className="text-slate-600">{ing.item}</span>
                      <span className="shrink-0 tabular-nums text-slate-500">
                        {fmt(ing.amountGrams, 0)} g{ing.unit ? ` · ${ing.unit}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                {dish.notes ? (
                  <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {dish.notes}
                  </p>
                ) : null}
                <DishSwitcher
                  count={currentMeal.variations.length}
                  index={currentMeal.selectedIndex}
                  onChange={(i) => setSelectedVariation(today, currentMeal.id, i)}
                />
              </div>
            </section>
          ) : (
            <section className="mb-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {t('today.nextMeal')}
              </h2>
              {upcoming[0] ? (
                <div className="mt-2">
                  <p className="text-lg font-bold text-slate-800">{t(upcoming[0].slot.labelKey)}</p>
                  <p className="text-sm text-slate-500">
                    {timeWindowLabel(upcoming[0].slot)} · {startsInLabel(upcoming[0].startsInMinutes, coreT)}
                  </p>
                </div>
              ) : null}
            </section>
          )}

          {/* Right column: daily macros + upcoming meals */}
          <div className="space-y-5">
          {/* Daily macro progress */}
          {targets ? (
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-slate-700">{t('today.dailyTitle')}</h2>
                <span className="text-xs text-slate-400">{t('today.vsDailyTarget')}</span>
              </div>
              <div className="space-y-3">
                <MacroBar
                  label={t('macro.kcal')}
                  value={todayTotals.kcal}
                  target={targets.calorieTarget}
                  unit="kcal"
                  color="bg-emerald-500"
                />
                <MacroBar
                  label={t('macro.protein')}
                  value={todayTotals.protein}
                  target={targets.proteinG}
                  unit="g"
                  color="bg-sky-500"
                />
                <MacroBar
                  label={t('macro.carbs')}
                  value={todayTotals.carbs}
                  target={targets.carbsG}
                  unit="g"
                  color="bg-amber-500"
                />
                <MacroBar
                  label={t('macro.fat')}
                  value={todayTotals.fat}
                  target={targets.fatG}
                  unit="g"
                  color="bg-rose-500"
                />
              </div>
            </section>
          ) : null}

          {/* Upcoming meals */}
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {t('today.upcoming')}
            </h2>
            <div className="space-y-2.5">
              {upcoming.map(({slot, startsInMinutes}) => {
                const meal = todayPlan?.meals.find((m) => m.id === slot.id);
                const preview = meal ? getSelectedDish(meal) : null;
                return (
                  <button
                    key={slot.id}
                    onClick={() => onNavigate('plan')}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm active:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-700">{t(slot.labelKey)}</p>
                        {workoutBadgeFor(slot.id, workoutMeals) ? (
                          <span
                            className={
                              'rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ' +
                              (workoutBadgeFor(slot.id, workoutMeals) === 'pre'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-sky-100 text-sky-700')
                            }
                          >
                            {t(`badge.${workoutBadgeFor(slot.id, workoutMeals)}`)}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-slate-400">
                        {preview ? preview.name : t('today.noSuggestion')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-emerald-600">
                        {startsInLabel(startsInMinutes, coreT)}
                      </p>
                      <p className="text-xs tabular-nums text-slate-400">
                        {timeWindowLabel(slot)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          </div>
        </div>
      )}

    </div>
  );
}
