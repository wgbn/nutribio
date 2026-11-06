// Lazy database client for the API.
//
// The API connects with its own `nutribio_api` role (bypassrls) — locally the
// stack's postgres URL is used. One pool per process; Nitro closes it on
// shutdown (server/plugins/shutdown.ts).

import {createDb} from '@nutribio/db';

type DbBundle = ReturnType<typeof createDb>;

let bundle: DbBundle | null = null;

export function useDb(): DbBundle['db'] {
  if (!bundle) {
    const {databaseUrl} = useRuntimeConfig();
    if (!databaseUrl) throw new Error('NUXT_DATABASE_URL is not set');
    bundle = createDb(databaseUrl);
  }
  return bundle.db;
}

export async function closeDb(): Promise<void> {
  if (!bundle) return;
  const current = bundle;
  bundle = null;
  await current.client.end({timeout: 5});
}
