// Consent records (DECISIONS #29 / roadmap 5.3): one row per document and
// version the user accepted, plus the withdrawal timestamp when applicable.
// A document version bump requires re-consent, so the API compares the stored
// `version` against the current one shipped with the app.

import {sql} from 'drizzle-orm';
import {check, index, text, timestamp, uuid} from 'drizzle-orm/pg-core';
import {appSchema} from './schema';
import {valueList} from './helpers';
import {CONSENT_DOCUMENT_VALUES, LOCALE_VALUES} from './values';

export const consents = appSchema.table(
  'consents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    document: text('document').notNull(),
    version: text('version').notNull(),
    locale: text('locale').notNull(),
    grantedAt: timestamp('granted_at', {withTimezone: true}).notNull().defaultNow(),
    withdrawnAt: timestamp('withdrawn_at', {withTimezone: true}),
  },
  (t) => [
    check('consents_document_check', sql`${t.document} in ${valueList(CONSENT_DOCUMENT_VALUES)}`),
    check('consents_locale_check', sql`${t.locale} in ${valueList(LOCALE_VALUES)}`),
    index('consents_user_document_idx').on(t.userId, t.document, t.grantedAt.desc()),
  ],
).enableRLS();
