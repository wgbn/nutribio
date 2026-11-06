// Typed model for the in-app legal texts (roadmap item 5, phase 5.2).
//
// The texts are plain data (no Markdown, no HTML) so they render without a
// parser or sanitizer, and so the structure can be verified across locales by
// `npm run i18n:check`. Versions come from `@nutribio/core` (`legal.ts`) and
// are recorded in `app.consents` by the API (phase 5.3).

import type {LegalDocumentId} from '@nutribio/core';

export type LegalBlock =
  | {type: 'heading'; text: string}
  | {type: 'paragraph'; text: string}
  | {type: 'list'; items: string[]}
  | {type: 'note'; text: string};

export interface LegalDocument {
  id: LegalDocumentId;
  title: string;
  /** Version identifier recorded in `app.consents` — must match core. */
  version: string;
  /** ISO date of the last change to this text. */
  updatedAt: string;
  blocks: LegalBlock[];
}

export type LegalCatalog = Record<LegalDocumentId, LegalDocument>;
