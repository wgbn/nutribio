// Modal confirmation dialog (used before regenerating the plan, resets, etc).

import type {ReactNode} from 'react';
import {XIcon} from './icons';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  const confirmClass =
    variant === 'danger'
      ? 'bg-rose-600 text-white active:bg-rose-700'
      : 'bg-emerald-600 text-white active:bg-emerald-700';
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {!busy && (
            <button
              onClick={onCancel}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar"
            >
              <XIcon size={20} />
            </button>
          )}
        </div>
        <div className="text-sm leading-relaxed text-slate-600">{message}</div>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? 'A gerar…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
