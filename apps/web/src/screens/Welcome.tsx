// In-app landing screen shown before onboarding on first use (roadmap item 2,
// DECISIONS #33). Explains the app, offers the language selector and the
// "Get started" CTA. No auth CTA yet — that arrives with Wave 6 (DECISIONS
// #22/#24). Pure presentation: no data is written and no API is called.

import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import type {LegalDocumentId} from '@nutribio/core';

import {
  ActivityIcon,
  AlertIcon,
  CalendarIcon,
  CartIcon,
  ChartIcon,
  ClockIcon,
  GlobeIcon,
  LeafIcon,
  RestaurantIcon,
  ScaleIcon,
  ShieldIcon,
  SparklesIcon,
} from '../components/icons';
import {useStore} from '../hooks/useStore';
import {changeLocale} from '../i18n';
import {LOCALES, LOCALE_LABELS, type LocaleSetting} from '../i18n/locales';

export function Welcome({
  onStart,
  onOpenLegal,
}: {
  onStart: () => void;
  onOpenLegal: (id: LegalDocumentId) => void;
}) {
  const {t} = useTranslation();
  const {settings, saveSettings} = useStore();

  const languageOptions = useMemo(
    () => [
      {value: 'auto', label: t('settings.languageAuto')},
      ...LOCALES.map((l) => ({value: l, label: LOCALE_LABELS[l]})),
    ],
    [t],
  );

  // Same behavior as the Settings selector: persist the choice and switch
  // immediately (the Welcome copy re-renders in the new locale).
  const handleLanguageChange = (value: string) => {
    const locale = value as LocaleSetting;
    saveSettings({locale});
    void changeLocale(locale);
  };

  const steps = [
    {icon: <ScaleIcon size={20} />, title: t('welcome.how.step1Title'), body: t('welcome.how.step1Body')},
    {icon: <ChartIcon size={20} />, title: t('welcome.how.step2Title'), body: t('welcome.how.step2Body')},
    {icon: <SparklesIcon size={20} />, title: t('welcome.how.step3Title'), body: t('welcome.how.step3Body')},
  ];

  const features = [
    {icon: <ClockIcon size={18} />, title: t('welcome.features.todayTitle'), body: t('welcome.features.todayBody')},
    {icon: <ActivityIcon size={18} />, title: t('welcome.features.workoutTitle'), body: t('welcome.features.workoutBody')},
    {icon: <ChartIcon size={18} />, title: t('welcome.features.progressTitle'), body: t('welcome.features.progressBody')},
    {icon: <CartIcon size={18} />, title: t('welcome.features.shoppingTitle'), body: t('welcome.features.shoppingBody')},
  ];

  const preview = [
    {icon: <CalendarIcon size={16} />, label: t('welcome.preview.days')},
    {icon: <RestaurantIcon size={16} />, label: t('welcome.preview.meals')},
    {icon: <SparklesIcon size={16} />, label: t('welcome.preview.variations')},
    {icon: <CartIcon size={16} />, label: t('welcome.preview.shopping')},
  ];

  return (
    <div className="min-h-dvh bg-[#f6f8f7]">
      <div
        className="mx-auto w-full max-w-md px-5 pb-12 md:max-w-6xl md:px-8"
        style={{paddingTop: 'env(safe-area-inset-top)'}}
      >
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <LeafIcon size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-700">Nutribio</span>
          </div>
          <label className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-500">
            <GlobeIcon size={15} className="shrink-0" />
            <select
              value={settings.locale}
              aria-label={t('welcome.language')}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="min-w-0 bg-transparent text-xs font-medium text-slate-600 focus:outline-none"
            >
              {languageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        {/* Hero */}
        <section className="mt-4 md:mt-12 md:grid md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <SparklesIcon size={13} />
              {t('welcome.hero.badge')}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-800 md:text-4xl">
              {t('welcome.hero.title')}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 md:text-base">
              {t('welcome.hero.subtitle')}
            </p>
            <button
              onClick={onStart}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700 md:w-auto md:px-8"
            >
              {t('welcome.hero.cta')}
            </button>
            <p className="mt-3 text-xs text-slate-400">{t('welcome.hero.note')}</p>
          </div>

          <div className="mt-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm md:mt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {t('welcome.preview.title')}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {preview.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-xs font-medium text-slate-600 shadow-sm"
                >
                  <span className="text-emerald-600">{p.icon}</span>
                  <span className="min-w-0">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-12 md:mt-20">
          <h2 className="text-lg font-bold text-slate-800 md:text-xl">{t('welcome.how.title')}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3 md:gap-4">
            {steps.map((s) => (
              <div key={s.title} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  {s.icon}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-12 md:mt-20">
          <h2 className="text-lg font-bold text-slate-800 md:text-xl">{t('welcome.features.title')}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                  {f.icon}
                  <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy + health disclaimer */}
        <section className="mt-12 grid gap-3 md:mt-20 md:grid-cols-2 md:gap-4">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldIcon size={18} />
              <p className="text-sm font-semibold">{t('welcome.privacy.title')}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
              {t('welcome.privacy.body')}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
              {(['terms', 'privacy', 'health_disclaimer'] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => onOpenLegal(id)}
                  className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                >
                  {t(`legal.doc.${id}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertIcon size={18} />
              <p className="text-sm font-semibold">{t('welcome.disclaimer.title')}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
              {t('welcome.disclaimer.body')}
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-10 flex flex-col items-center md:mt-16">
          <button
            onClick={onStart}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-emerald-700 md:w-auto md:px-10"
          >
            {t('welcome.hero.cta')}
          </button>
          <p className="mt-6 text-center text-[11px] text-slate-300">{t('welcome.footer')}</p>
        </section>
      </div>
    </div>
  );
}
