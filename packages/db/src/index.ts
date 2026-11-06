// @nutribio/db — Postgres schema (Drizzle) and client factory.
//
// The schema is the single source of truth for the database: drizzle-kit
// generates SQL migrations into `supabase/migrations` and the Supabase CLI
// applies them locally and to the hosted project (DECISIONS #37). The web app
// never imports this package — only the Nuxt API does.

export * from './schema';
export {createDb, type Db} from './client';
