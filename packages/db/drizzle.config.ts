import {defineConfig} from 'drizzle-kit';

// Drizzle owns the schema definition; the SQL it generates lands in
// `supabase/migrations` so the Supabase CLI (local stack + hosted project) is
// the only thing that applies migrations (DECISIONS #37).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema',
  out: './supabase/migrations',
  schemaFilter: ['app'],
  migrations: {
    prefix: 'supabase',
    table: '__drizzle_migrations',
    schema: 'drizzle',
  },
  // Only needed by the introspection commands (`db:push`, `db:pull`); the
  // normal workflow generates SQL offline and lets the Supabase CLI apply it.
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
