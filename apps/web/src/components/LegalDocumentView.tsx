// Full-screen reader for the legal documents (roadmap item 5, phase 5.2).
// Renders the typed blocks of `apps/web/src/legal/<locale>` — plain data, no
// Markdown/HTML — with the document version and a "pending legal review" note
// until the owner + lawyer checkpoint is signed off (LEGAL_TEXTS_APPROVED).

import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {LEGAL_TEXTS_APPROVED, type LegalDocumentId} from '@nutribio/core';

import {ChevronLeftIcon} from './icons';
import {activeLocale} from '../i18n/locales';
import {loadLegalCatalog} from '../legal';
import type {LegalBlock, LegalDocument} from '../legal/types';
import {fmtDate} from '../lib/units';

function Block({block}: {block: LegalBlock}) {
  switch (block.type) {
    case 'heading':
      return <h2 className="mt-6 text-base font-bold text-slate-800">{block.text}</h2>;
    case 'list':
      return (
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'note':
      return (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          {block.text}
        </p>
      );
    default:
      return <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.text}</p>;
  }
}

export function LegalDocumentView({
  documentId,
  onClose,
}: {
  documentId: LegalDocumentId;
  onClose: () => void;
}) {
  const {t, i18n} = useTranslation();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [failed, setFailed] = useState(false);

  // Load the text for the active locale; reload when the language changes.
  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setFailed(false);
    loadLegalCatalog(activeLocale())
      .then((catalog) => {
        if (!cancelled) setDocument(catalog[documentId]);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [documentId, i18n.language]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f8f7]">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-12 pt-4">
        <header
          className="mb-4 flex items-center gap-2"
          style={{paddingTop: 'env(safe-area-inset-top)'}}
        >
          <button
            onClick={onClose}
            aria-label={t('legal.back')}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronLeftIcon size={22} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-slate-800">
            {document?.title ?? t('legal.loading')}
          </h1>
        </header>

        {document ? (
          <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <p className="text-xs text-slate-400">
              {t('legal.version', {version: document.version})} ·{' '}
              {t('legal.updated', {date: fmtDate(document.updatedAt)})}
            </p>
            {!LEGAL_TEXTS_APPROVED ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                {t('legal.pendingReview')}
              </p>
            ) : null}
            <div className="mt-4">
              {document.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>
          </article>
        ) : failed ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {t('legal.loadError')}
          </p>
        ) : (
          <p className="px-1 text-sm text-slate-400">{t('legal.loading')}</p>
        )}
      </div>
    </div>
  );
}
