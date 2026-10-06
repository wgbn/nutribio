// Settings overlay: language, Gemini key/model, diet preferences, PWA
// install, export/import and reset.

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {ConfirmDialog} from '../components/ConfirmDialog';
import {Field, Select, TextArea, TextInput} from '../components/Field';
import {DownloadIcon, RefreshIcon, TrashIcon, UploadIcon, XIcon} from '../components/icons';
import {useInstallPrompt} from '../hooks/useInstallPrompt';
import {useStore} from '../hooks/useStore';
import {changeLocale} from '../i18n';
import {LOCALES, LOCALE_LABELS, type LocaleSetting} from '../i18n/locales';
import type {ModelOption} from '../lib/models';
import {DEFAULT_MODEL, exportAllData, importAllData, MODEL_OPTIONS} from '../lib/storage';

export function Settings({onClose}: {onClose: () => void}) {
  const {t} = useTranslation();
  const {settings, saveSettings, profile, saveProfile, resetAll} = useStore();
  const {canInstall, installed, promptInstall} = useInstallPrompt();
  const [showKey, setShowKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[] | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsErrorMsg, setModelsErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const languageOptions = useMemo(
    () => [
      {value: 'auto', label: t('settings.languageAuto')},
      ...LOCALES.map((l) => ({value: l, label: LOCALE_LABELS[l]})),
    ],
    [t],
  );

  const handleLanguageChange = (value: string) => {
    const locale = value as LocaleSetting;
    saveSettings({locale});
    void changeLocale(locale);
  };

  /** Fetch the live model list from the Gemini API (lazy SDK import). */
  const loadModels = useCallback(async (key: string) => {
    setModelsLoading(true);
    setModelsErrorMsg(null);
    try {
      const {fetchAvailableModels} = await import('../lib/models');
      const list = await fetchAvailableModels(key);
      if (list.length === 0) {
        // API succeeded but nothing passed the filter: fall back to the
        // static list with a note instead of an empty dropdown.
        setModels(null);
        setModelsErrorMsg(t('settings.modelsEmpty'));
      } else {
        setModels(list);
      }
    } catch (err) {
      const {describeError} = await import('../lib/errors');
      setModelsErrorMsg(describeError(err));
      setModels(null);
    } finally {
      setModelsLoading(false);
    }
  }, [t]);

  // Refresh the model list whenever the API key changes (or is set).
  useEffect(() => {
    const key = settings.geminiApiKey.trim();
    if (!key) {
      setModels(null);
      setModelsLoading(false);
      setModelsErrorMsg(null);
      return;
    }
    void loadModels(key);
  }, [settings.geminiApiKey, loadModels]);

  const modelOptions = useMemo(() => {
    const base = (models ?? MODEL_OPTIONS).map((m) =>
      typeof m === 'string' ? {value: m, label: m} : {value: m.value, label: m.label},
    );
    const hasCurrent = base.some((o) => o.value === settings.model);
    if (!hasCurrent) {
      base.push({
        value: settings.model,
        label: `${settings.model} ${t('settings.modelCustomSuffix')}`,
      });
    }
    return base;
  }, [models, settings.model, t]);

  const handleExport = () => {
    const blob = new Blob([exportAllData()], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutribio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      if (importAllData(text)) {
        setNotice(t('settings.importNotice'));
        setTimeout(() => window.location.reload(), 800);
      } else {
        setNotice(t('settings.importInvalid'));
      }
    } catch {
      setNotice(t('settings.importError'));
    }
  };

  const handleReset = () => {
    resetAll();
    setConfirmReset(false);
    setNotice(t('settings.resetNotice'));
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f8f7]">
      <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 pb-10 pt-4">
        <header
          className="mb-4 flex items-center justify-between"
          style={{paddingTop: 'env(safe-area-inset-top)'}}
        >
          <h1 className="text-xl font-bold text-slate-800">{t('settings.title')}</h1>
          <button
            onClick={onClose}
            aria-label={t('settings.closeSettings')}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XIcon size={22} />
          </button>
        </header>

        {notice ? (
          <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}

        <div className="md:grid md:grid-cols-2 md:items-start md:gap-4">
        {/* Gemini */}
        <section className="mb-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2 md:mb-0">
          <h2 className="text-sm font-semibold text-slate-700">{t('settings.gemini')}</h2>
          <Field label={t('settings.apiKey')} hint={t('settings.apiKeyHint')}>
            <div className="relative">
              <TextInput
                type={showKey ? 'text' : 'password'}
                value={settings.geminiApiKey}
                placeholder={t('settings.apiKeyPlaceholder')}
                autoComplete="off"
                onChange={(e) => saveSettings({geminiApiKey: e.target.value})}
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute inset-y-0 right-1.5 my-auto h-8 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                {showKey ? t('common.hide') : t('common.show')}
              </button>
            </div>
          </Field>
          <Field label={t('settings.model')} hint={t('settings.modelHint')}>
            <Select
              options={modelOptions}
              value={settings.model}
              onChange={(e) => saveSettings({model: e.target.value})}
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p
                className={
                  'text-xs ' +
                  (modelsErrorMsg ? 'break-words text-rose-600' : 'text-slate-400')
                }
              >
                {modelsLoading
                  ? t('settings.loadingModels')
                  : modelsErrorMsg
                    ? modelsErrorMsg
                    : models
                      ? t('settings.modelsAvailable', {count: models.length})
                      : t('settings.modelsFallback')}
              </p>
              <button
                type="button"
                onClick={() => {
                  const key = settings.geminiApiKey.trim();
                  if (key) void loadModels(key);
                }}
                disabled={modelsLoading || !settings.geminiApiKey.trim()}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-40"
              >
                <RefreshIcon size={12} />
                {t('settings.refresh')}
              </button>
            </div>
          </Field>
          {!settings.geminiApiKey ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {t('settings.noKeyWarning')}{' '}
              <span className="font-medium">aistudio.google.com/apikey</span>
            </p>
          ) : null}
          {settings.model !== DEFAULT_MODEL ? (
            <p className="text-xs text-slate-400">
              {t('settings.modelNote', {model: settings.model, def: DEFAULT_MODEL})}
            </p>
          ) : null}
        </section>

        {/* Diet preferences */}
        <section className="mb-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2 md:mb-0">
          <h2 className="text-sm font-semibold text-slate-700">{t('settings.dietPrefs')}</h2>
          <Field label={t('diet.excludedFoods')} hint={t('diet.excludedFoodsHint')}>
            <TextArea
              rows={4}
              placeholder={t('diet.excludedFoodsPlaceholder')}
              value={profile?.excludedFoods ?? ''}
              onChange={(e) => {
                if (profile) saveProfile({...profile, excludedFoods: e.target.value});
              }}
            />
          </Field>
          <Field label={t('diet.observations')} hint={t('diet.observationsHint')}>
            <TextArea
              rows={6}
              placeholder={t('diet.observationsPlaceholder')}
              value={profile?.observations ?? ''}
              onChange={(e) => {
                if (profile) saveProfile({...profile, observations: e.target.value});
              }}
            />
          </Field>
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {t('settings.dietNote')}
          </p>
        </section>

        {/* App: language + install */}
        <section className="mb-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mb-0">
          <h2 className="text-sm font-semibold text-slate-700">{t('settings.appSection')}</h2>
          <Field label={t('settings.language')} hint={t('settings.languageHint')}>
            <Select
              options={languageOptions}
              value={settings.locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
            />
          </Field>
          <div>
            <p className="text-xs text-slate-400">{t('settings.installHint')}</p>
            {installed ? (
              <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                {t('settings.installed')}
              </p>
            ) : canInstall ? (
              <button
                onClick={() => void promptInstall()}
                className="mt-3 w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white active:bg-slate-900"
              >
                {t('settings.install')}
              </button>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {t('settings.installHTTPS')}
              </p>
            )}
          </div>
        </section>

        {/* Data */}
        <section className="mb-4 space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:mb-0">
          <h2 className="text-sm font-semibold text-slate-700">{t('settings.dataSection')}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-50"
            >
              <DownloadIcon size={15} />
              {t('settings.export')}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-50"
            >
              <UploadIcon size={15} />
              {t('settings.import')}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImportFile(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 active:bg-rose-50"
          >
            <TrashIcon size={15} />
            {t('settings.deleteAll')}
          </button>
        </section>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-300">
          {t('settings.footer')}
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title={t('settings.deleteAsk.title')}
        message={t('settings.deleteAsk.message')}
        confirmLabel={t('settings.deleteAsk.confirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
