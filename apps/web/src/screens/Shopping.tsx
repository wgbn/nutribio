// "Shopping" screen: weekly shopping list aggregated from the plan.
// It covers ALL dish variations and is explicitly a SUGGESTION — each item
// shows which dishes use it so the user buys only what they will cook.

import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {CartIcon, CheckIcon, CopyIcon, GearIcon, ShareIcon} from '../components/icons';
import {GeneratePlanButton} from '../components/GeneratePlanButton';
import {useStore} from '../hooks/useStore';
import {MEAL_LABEL_KEYS, WEEKDAY_KEY} from '../lib/mealTimes';
import {
  buildShoppingList,
  SHOPPING_CATEGORY_ORDER,
  type ShoppingRow,
} from '../lib/shopping';
import {fmt} from '../lib/units';
import type {ShoppingCategory} from '../types';

const CATEGORY_KEYS: Record<ShoppingCategory, string> = {
  produce: 'shopping.category.produce',
  meat_fish: 'shopping.category.meat_fish',
  dairy_eggs: 'shopping.category.dairy_eggs',
  bakery_grains: 'shopping.category.bakery_grains',
  pantry: 'shopping.category.pantry',
  frozen: 'shopping.category.frozen',
  drinks: 'shopping.category.drinks',
  other: 'shopping.category.other',
};

export function Shopping({onOpenSettings}: {onOpenSettings: () => void}) {
  const {t} = useTranslation();
  const {plan, shoppingChecks, toggleShoppingItem} = useStore();
  const [hideBought, setHideBought] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);

  const rows = useMemo(
    () => (plan ? buildShoppingList(plan.week, plan.shoppingItems ?? []) : []),
    [plan],
  );

  const bought = useMemo(() => new Set(shoppingChecks), [shoppingChecks]);

  const visibleRows = useMemo(
    () => (hideBought ? rows.filter((r) => !bought.has(r.key)) : rows),
    [rows, hideBought, bought],
  );

  const grouped = useMemo(() => {
    const map = new Map<ShoppingCategory, ShoppingRow[]>();
    for (const row of visibleRows) {
      const list = map.get(row.category) ?? [];
      list.push(row);
      map.set(row.category, list);
    }
    return SHOPPING_CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      rows: map.get(c)!,
    }));
  }, [visibleRows]);

  const totalItems = rows.length;
  const boughtCount = rows.filter((r) => bought.has(r.key)).length;

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const plainText = useMemo(() => {
    const lines: string[] = [];
    for (const {category, rows: group} of grouped) {
      lines.push(`— ${t(CATEGORY_KEYS[category])} —`);
      for (const row of group) {
        lines.push(
          `• ${row.name} — ${row.quantityLabel}${row.packageLabel ? ` (${row.packageLabel})` : ''}`,
        );
      }
      lines.push('');
    }
    return lines.join('\n').trim();
  }, [grouped, t]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setNotice(t('shopping.copied'));
    } catch {
      setNotice(t('shopping.copyFailed'));
    }
    window.setTimeout(() => setNotice(null), 2500);
  };

  const shareList = async () => {
    if (navigator.share) {
      try {
        await navigator.share({text: plainText});
        return;
      } catch {
        // Share sheet dismissed — fall back to copying.
      }
    }
    await copyToClipboard();
  };

  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6 md:pb-12">
        <div className="mt-16 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CartIcon size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{t('shopping.noPlan.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('shopping.noPlan.body')}</p>
          <GeneratePlanButton
            label={t('shopping.noPlan.cta')}
            icon={<CartIcon size={16} />}
            className="mt-5 w-full py-3"
          />
        </div>
      </div>
    );
  }

  // A plan without a shopping catalog (legacy plan or a generation that
  // omitted it) still gets a usable basic list via the aggregation fallback.
  const hasCatalog = !!plan.shoppingItems && plan.shoppingItems.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
      <header
        className="flex items-start justify-between"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t('shopping.title')}</h1>
          <p className="text-sm text-slate-400">{t('shopping.subtitle', {count: totalItems})}</p>
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
        <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {/* Suggestion disclaimer */}
      <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800">
        <p className="font-semibold">{t('shopping.suggestion.title')}</p>
        <p className="mt-0.5">{t('shopping.suggestion.body')}</p>
      </div>

      {/* Basic (uncatalogued) list note — legacy plans or a generation that
          omitted the shopping catalog. */}
      {!hasCatalog ? (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          {t('shopping.basicNote')}
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={hideBought}
            onChange={(e) => setHideBought(e.target.checked)}
            className="accent-emerald-600"
          />
          {t('shopping.hideBought')}
        </label>
        {boughtCount > 0 ? (
          <span className="text-xs text-slate-400">
            {t('shopping.boughtCount', {count: boughtCount, total: totalItems})}
          </span>
        ) : null}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => void copyToClipboard()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 active:bg-slate-50"
          >
            <CopyIcon size={14} />
            {t('shopping.copy')}
          </button>
          <button
            onClick={() => void shareList()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white active:bg-slate-900"
          >
            <ShareIcon size={14} />
            {t('shopping.share')}
          </button>
        </div>
      </div>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">{t('shopping.allBought')}</p>
      ) : (
        <div className="mt-4 space-y-6 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 xl:grid-cols-3">
          {grouped.map(({category, rows: group}) => (
            <section
              key={category}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <h2 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                {t(CATEGORY_KEYS[category])}
              </h2>
              <ul className="space-y-1.5">
                {group.map((row) => {
                  const isBought = bought.has(row.key);
                  const isOpen = expanded.has(row.key);
                  return (
                    <li
                      key={row.key}
                      className={
                        'rounded-xl px-2.5 py-2 transition-colors ' +
                        (isOpen ? 'bg-slate-50' : 'hover:bg-slate-50/60')
                      }
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleShoppingItem(row.key)}
                          aria-label={t('shopping.toggleBought', {name: row.name})}
                          aria-pressed={isBought}
                          className={
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ' +
                            (isBought
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white text-transparent')
                          }
                        >
                          <CheckIcon size={12} />
                        </button>
                        <button
                          onClick={() => toggleExpand(row.key)}
                          className="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left"
                          aria-expanded={isOpen}
                        >
                          <span
                            className={
                              'truncate text-sm font-medium ' +
                              (isBought ? 'text-slate-400 line-through' : 'text-slate-700')
                            }
                          >
                            {row.name}
                          </span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                            {row.quantityLabel}
                          </span>
                        </button>
                      </div>
                      {row.packageLabel ? (
                        <p className="mt-0.5 pl-7 text-[11px] text-slate-400">
                          {row.packageLabel}
                        </p>
                      ) : null}
                      {isOpen ? (
                        <ul className="mt-1.5 space-y-1 border-t border-slate-100 pl-7 pt-1.5">
                          {row.dishes.map((d, i) => (
                            <li key={i} className="text-[11px] text-slate-500">
                              {t(WEEKDAY_KEY[d.day])} · {t(MEAL_LABEL_KEYS[d.meal])} — {d.dish}{' '}
                              <span className="tabular-nums text-slate-400">
                                ({fmt(d.grams, 0)} g)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
