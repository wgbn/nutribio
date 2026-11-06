// Database client factory, consumed by the Nuxt API (`apps/api`, phase 4.4).
//
// The API connects with its own `nutribio_api` role (bypassrls) through the
// Supabase session pooler. `prepare: false` keeps the driver compatible with
// the transaction pooler (port 6543) if the host ever switches to it.

import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export function createDb(connectionString: string, options: {max?: number} = {}) {
  const client = postgres(connectionString, {
    max: options.max ?? 10,
    prepare: false,
  });
  const db = drizzle(client, {schema});
  return {db, client};
}

export type Db = ReturnType<typeof createDb>['db'];
