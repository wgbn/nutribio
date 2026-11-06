// App-only types. Domain types live in @nutribio/core (shared with the API).

import type {LocaleSetting} from '@nutribio/core';

export interface Settings {
  geminiApiKey: string;
  model: string;
  /** App language: 'auto' (device language) or a specific locale. */
  locale: LocaleSetting;
}

export type TabId = 'today' | 'plan' | 'shopping' | 'progress' | 'data';
