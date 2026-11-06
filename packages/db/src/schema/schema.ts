// Private Postgres schema for all application data.
//
// `app` is intentionally NOT part of the Supabase Data API exposed schemas:
// only the Nuxt API (its own `nutribio_api` role) reads and writes it, while
// every table keeps RLS enabled with no policies (DECISIONS #22, #37).

import {pgSchema} from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');
