// Legal document ids and versions (roadmap item 5, phase 5.2 / DECISIONS #29).
//
// Core holds only the identifiers and the versions — the texts themselves live
// in `apps/web/src/legal/` (typed blocks, one module per locale). The API
// records these versions in `app.consents` (phase 5.3), so a version bump in
// this file is what forces a re-consent: bump it whenever the accepted text
// changes, never silently edit a version in place.

export const LEGAL_DOCUMENT_IDS = ['terms', 'privacy', 'health_data', 'health_disclaimer'] as const;

export type LegalDocumentId = (typeof LEGAL_DOCUMENT_IDS)[number];

/** Version of each document currently shipped with the app. */
export const LEGAL_DOCUMENT_VERSIONS: Record<LegalDocumentId, string> = {
  terms: 'v1',
  privacy: 'v1',
  health_data: 'v1',
  health_disclaimer: 'v1',
};

/**
 * Consent documents stored in `app.consents` (mirrors the database CHECK).
 * `age_18` is a self-declaration, not a text, but it is recorded the same way.
 */
export const CONSENT_DOCUMENT_IDS = ['terms_privacy', 'health_data', 'age_18'] as const;

export type ConsentDocumentId = (typeof CONSENT_DOCUMENT_IDS)[number];

/** Version recorded for each consent document. */
export const CONSENT_DOCUMENT_VERSIONS: Record<ConsentDocumentId, string> = {
  terms_privacy: 'v1',
  health_data: 'v1',
  age_18: 'v1',
};

/** Legal documents whose acceptance each consent document covers. */
export const CONSENT_DOCUMENT_SOURCES: Record<ConsentDocumentId, readonly LegalDocumentId[]> = {
  terms_privacy: ['terms', 'privacy'],
  health_data: ['health_data'],
  age_18: [],
};

/**
 * Whether the shipped texts passed the owner + lawyer review (phase 5.2
 * checkpoint). While false the in-app reader shows a "pending legal review"
 * note. Flip to true only after the review is signed off — the texts and
 * versions do not change when the flag flips.
 */
export const LEGAL_TEXTS_APPROVED = false;
