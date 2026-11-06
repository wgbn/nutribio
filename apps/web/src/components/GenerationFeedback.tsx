// Global feedback for plan generation: a full-screen loading overlay while
// the Gemini call runs, and a toast when it finishes (success or error).

import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useStore} from '../hooks/useStore';
import {CheckIcon, LeafIcon, RefreshIcon, XIcon} from './icons';

interface ToastState {
  kind: 'success' | 'error';
  message: string;
}

export function GenerationFeedback({onViewPlan}: {onViewPlan: () => void}) {
  const {
    isGenerating,
    generationStage,
    plan,
    generationError,
    generatePlan,
    dismissGenerationError,
  } = useStore();
  const {t} = useTranslation();

  const [toast, setToast] = useState<ToastState | null>(null);
  const prevGenerating = useRef(isGenerating);
  const prevPlan = useRef(plan);

  // Detect the end of a generation run and decide success vs error.
  useEffect(() => {
    if (prevGenerating.current && !isGenerating) {
      const planChanged = plan !== null && plan !== prevPlan.current;
      if (planChanged) {
        setToast({kind: 'success', message: t('generation.success')});
      } else if (generationError) {
        setToast({kind: 'error', message: generationError});
      }
    }
    prevGenerating.current = isGenerating;
    prevPlan.current = plan;
  }, [isGenerating, plan, generationError, t]);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
      if (toast.kind === 'error') dismissGenerationError();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, dismissGenerationError]);

  return (
    <>
      {/* Loading overlay */}
      {isGenerating ? (
        <div
          role="status"
          aria-live="assertive"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-white/90 px-6 backdrop-blur-sm"
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-600" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <LeafIcon size={28} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{t('generation.title')}</p>
            <p className="mt-1 text-sm text-slate-500">
              {generationStage ? t(generationStage) : t('generation.hint')}
            </p>
          </div>
          <p className="max-w-xs text-center text-xs text-slate-400">
            {t('generation.keepOpen')}
          </p>
        </div>
      ) : null}

      {/* Result toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={
            'animate-toast-in fixed left-1/2 top-4 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 ' +
            'rounded-2xl p-4 text-white shadow-lg md:left-auto md:right-6 md:top-6 md:w-auto md:min-w-80 md:max-w-sm md:translate-x-0'
          }
        >
          <div
            className={
              'flex items-start gap-3 rounded-2xl p-4 ' +
              (toast.kind === 'success' ? 'bg-emerald-600' : 'bg-rose-600')
            }
          >
            <div className="mt-0.5 shrink-0">
              {toast.kind === 'success' ? <CheckIcon size={20} /> : <XIcon size={20} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.message}</p>
              <div className="mt-2 flex gap-2">
                {toast.kind === 'success' ? (
                  <button
                    onClick={() => {
                      setToast(null);
                      onViewPlan();
                    }}
                    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
                  >
                    {t('generation.viewPlan')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setToast(null);
                      dismissGenerationError();
                      void generatePlan();
                    }}
                    className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
                  >
                    <RefreshIcon size={12} />
                    {t('generation.retry')}
                  </button>
                )}
                <button
                  onClick={() => {
                    setToast(null);
                    if (toast.kind === 'error') dismissGenerationError();
                  }}
                  aria-label={t('a11y.closeNotice')}
                  className="rounded-lg px-2 py-1.5 text-xs text-white/70 hover:bg-white/20 hover:text-white"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
