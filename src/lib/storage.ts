// localStorage persistence for Nutribio.
// All data is local and single-device by design (no backend, no sync).

import type {BioRecord, BiometricsState, Plan, Profile, Settings} from '../types';

const NAMESPACE = 'nutribio.v1';
const SCHEMA_VERSION_KEY = `${NAMESPACE}.schemaVersion`;
const SCHEMA_VERSION = 1;

const KEYS = {
  profile: `${NAMESPACE}.profile`,
  biometrics: `${NAMESPACE}.biometrics`,
  plan: `${NAMESPACE}.plan`,
  settings: `${NAMESPACE}.settings`,
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable; fail silently for now.
  }
}

export const loadProfile = (): Profile | null => read<Profile | null>(KEYS.profile, null);

export const saveProfile = (profile: Profile) => write(KEYS.profile, profile);

export const loadBiometrics = (): BiometricsState =>
  read<BiometricsState>(KEYS.biometrics, {latest: null, history: []});

export const saveBiometrics = (state: BiometricsState) => write(KEYS.biometrics, state);

export const loadPlan = (): Plan | null => read<Plan | null>(KEYS.plan, null);

export const savePlan = (plan: Plan) => write(KEYS.plan, plan);

export const loadSettings = (): Settings =>
  read<Settings>(KEYS.settings, {geminiApiKey: '', model: DEFAULT_MODEL});

export const saveSettings = (settings: Settings) => write(KEYS.settings, settings);

export const DEFAULT_MODEL = 'gemini-2.5-flash';

export const MODEL_OPTIONS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
];

/** Merge a new bioimpedance record into the history (dedupe by date). */
export function mergeBioRecord(
  state: BiometricsState,
  record: BioRecord,
): BiometricsState {
  const rest = state.history.filter((r) => r.date !== record.date);
  const history = [...rest, record].sort((a, b) => a.date.localeCompare(b.date));
  return {latest: record, history};
}

export function clearAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(SCHEMA_VERSION_KEY);
}

export function ensureSchemaVersion() {
  const current = Number(localStorage.getItem(SCHEMA_VERSION_KEY) ?? 0);
  if (current < SCHEMA_VERSION) {
    localStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
  }
}

export function exportAllData(): string {
  const out: Record<string, unknown> = {};
  Object.values(KEYS).forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw) out[key] = JSON.parse(raw);
  });
  return JSON.stringify(out, null, 2);
}

export function importAllData(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    Object.values(KEYS).forEach((key) => {
      if (parsed[key] !== undefined) localStorage.setItem(key, JSON.stringify(parsed[key]));
    });
    return true;
  } catch {
    return false;
  }
}
