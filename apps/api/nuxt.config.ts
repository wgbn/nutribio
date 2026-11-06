// Nutribio API — Nuxt used as a server only (no pages, no client app).
//
// The API is the single owner of the `app` schema (DECISIONS #37): it verifies
// the Supabase access token against the project JWKS (DECISIONS #40) and maps
// every failure to an error code. Phase 4.4 runs locally only — the deploy
// (4.8) and the web data layer (4.6) come later.

export default defineNuxtConfig({
  compatibilityDate: '2026-11-06',
  ssr: false,
  telemetry: false,
  devtools: {enabled: false},
  nitro: {
    preset: 'node-server',
    // The workspace packages are consumed as TypeScript source, so Nitro must
    // bundle them instead of treating them as external dependencies.
    externals: {inline: ['@nutribio/core', '@nutribio/db']},
  },
  runtimeConfig: {
    // Server-only (never exposed to a client bundle). Env: NUXT_DATABASE_URL,
    // NUXT_SUPABASE_URL, NUXT_SUPABASE_SECRET_KEY, NUXT_CORS_ORIGINS.
    databaseUrl: '',
    supabaseUrl: '',
    supabaseSecretKey: '',
    /** Comma-separated allow-list of browser origins (DECISIONS #44). */
    corsOrigins: '',
  },
})
