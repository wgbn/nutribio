// Adapter between the core `Translate` contract and the i18next runtime.
// Core helpers (calculations, meal slots, plan normalization, prompt) receive
// this function instead of importing i18next (DECISIONS #35).

import i18next from 'i18next';
import type {Translate} from '@nutribio/core';

/** Translate a core label/error key with the active i18next language. */
export const coreT: Translate = (key, vars) => i18next.t(key, vars) as string;
