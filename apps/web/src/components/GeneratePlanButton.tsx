// Single, shared "generate plan" CTA. EVERY button that triggers plan
// generation must use this component (or call the same store action) so the
// behavior is identical everywhere: same action, same busy state, same
// disabled handling (DECISIONS: regeneration always user-confirmed).

import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

import {useStore} from '../hooks/useStore';

export function GeneratePlanButton({
  label,
  variant = 'primary',
  icon,
  className = '',
}: {
  label: string;
  variant?: 'primary' | 'warning';
  icon?: ReactNode;
  className?: string;
}) {
  const {t} = useTranslation();
  const {generatePlan, isGenerating, generationStage} = useStore();

  const classes =
    variant === 'warning'
      ? 'bg-amber-600 text-white active:bg-amber-700'
      : 'bg-emerald-600 text-white shadow-sm active:bg-emerald-700';

  return (
    <button
      onClick={() => void generatePlan()}
      disabled={isGenerating}
      className={
        `flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold disabled:opacity-60 ${classes} ` +
        className
      }
    >
      {isGenerating ? (
        <span>{generationStage ? t(generationStage) : t('common.generating')}</span>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}
