// Settings overlay: Gemini key, model, PWA install, export/import and reset.

import {useRef, useState} from 'react';

import {ConfirmDialog} from '../components/ConfirmDialog';
import {Field, Select, TextInput} from '../components/Field';
import {DownloadIcon, TrashIcon, UploadIcon, XIcon} from '../components/icons';
import {useInstallPrompt} from '../hooks/useInstallPrompt';
import {useStore} from '../hooks/useStore';
import {DEFAULT_MODEL, exportAllData, importAllData, MODEL_OPTIONS} from '../lib/storage';

export function Settings({onClose}: {onClose: () => void}) {
  const {settings, saveSettings, resetAll} = useStore();
  const {canInstall, installed, promptInstall} = useInstallPrompt();
  const [showKey, setShowKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
        setNotice('Dados importados. A recarregar…');
        setTimeout(() => window.location.reload(), 800);
      } else {
        setNotice('Ficheiro inválido. Nada foi alterado.');
      }
    } catch {
      setNotice('Não foi possível ler o ficheiro.');
    }
  };

  const handleReset = () => {
    resetAll();
    setConfirmReset(false);
    setNotice('Todos os dados foram apagados. A recarregar…');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f8f7]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-4">
        <header
          className="mb-4 flex items-center justify-between"
          style={{paddingTop: 'env(safe-area-inset-top)'}}
        >
          <h1 className="text-xl font-bold text-slate-800">Definições</h1>
          <button
            onClick={onClose}
            aria-label="Fechar definições"
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

        {/* Gemini */}
        <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Gemini</h2>
          <Field
            label="Chave da API"
            hint="Fica guardada apenas neste dispositivo (localStorage). Nunca é enviada para servidores teus."
          >
            <div className="relative">
              <TextInput
                type={showKey ? 'text' : 'password'}
                value={settings.geminiApiKey}
                placeholder="Cole a tua chave aqui"
                autoComplete="off"
                onChange={(e) => saveSettings({geminiApiKey: e.target.value})}
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute inset-y-0 right-1.5 my-auto h-8 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </Field>
          <Field label="Modelo" hint="Podes usar outro modelo Gemini compatível.">
            <Select
              options={[
                ...MODEL_OPTIONS.map((m) => ({value: m, label: m})),
                {value: settings.model, label: `${settings.model} (personalizado)`},
              ]}
              value={settings.model}
              onChange={(e) => saveSettings({model: e.target.value})}
            />
          </Field>
          {!settings.geminiApiKey ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Sem chave, podes guardar dados e ver cálculos, mas não consegues gerar planos com o
              Gemini. Obtém uma chave em{' '}
              <span className="font-medium">aistudio.google.com/apikey</span>.
            </p>
          ) : null}
          {settings.model !== DEFAULT_MODEL ? (
            <p className="text-xs text-slate-400">
              Modelo atual: <span className="font-medium">{settings.model}</span> (o default é{' '}
              {DEFAULT_MODEL}).
            </p>
          ) : null}
        </section>

        {/* Install */}
        <section className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Aplicação</h2>
          <p className="mt-1 text-xs text-slate-400">
            Instala o Nutribio na home screen do teu telemóvel para o usares como uma app.
          </p>
          {installed ? (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              O Nutribio já está instalado neste dispositivo.
            </p>
          ) : canInstall ? (
            <button
              onClick={() => void promptInstall()}
              className="mt-3 w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white active:bg-slate-900"
            >
              Instalar app
            </button>
          ) : (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Instalação disponível quando a app for servida por HTTPS (ou localhost). No Safari,
              usa «Partilhar → Adicionar ao ecrã principal».
            </p>
          )}
        </section>

        {/* Data */}
        <section className="mt-4 space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Os teus dados</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-50"
            >
              <DownloadIcon size={15} />
              Exportar
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-50"
            >
              <UploadIcon size={15} />
              Importar
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
            Apagar todos os dados
          </button>
        </section>

        <p className="mt-6 text-center text-[11px] text-slate-300">
          Nutribio v0.1 · Dados 100% locais · Sem contas, sem servidores
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Apagar todos os dados?"
        message="Vais perder o perfil, o histórico de medições e o plano atual. Esta ação não pode ser anulada."
        confirmLabel="Apagar tudo"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
