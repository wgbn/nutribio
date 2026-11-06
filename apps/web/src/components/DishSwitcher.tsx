// Variation switcher: arrows + dots + counter for a dish's variations.

import {useTranslation} from 'react-i18next';

import {ChevronLeftIcon, ChevronRightIcon} from './icons';

export function DishSwitcher({
  count,
  index,
  onChange,
}: {
  count: number;
  index: number;
  onChange: (nextIndex: number) => void;
}) {
  const {t} = useTranslation();
  if (count <= 1) return null;
  const prev = () => onChange((index - 1 + count) % count);
  const next = () => onChange((index + 1) % count);
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={prev}
        aria-label={t('a11y.prevVariation')}
        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
      >
        <ChevronLeftIcon size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {Array.from({length: count}, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              aria-label={t('a11y.variationN', {n: i + 1})}
              className={
                'h-2 rounded-full transition-all ' +
                (i === index ? 'w-5 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400')
              }
            />
          ))}
        </div>
        <span className="text-xs tabular-nums text-slate-400">
          {index + 1}/{count}
        </span>
      </div>
      <button
        onClick={next}
        aria-label={t('a11y.nextVariation')}
        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
      >
        <ChevronRightIcon size={20} />
      </button>
    </div>
  );
}
