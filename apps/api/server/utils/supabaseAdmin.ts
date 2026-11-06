// Supabase Admin API calls (account deletion, Item 5.4).
//
// Deleting the auth user is the only way to remove the account: every `app`
// row cascades from `auth.users` (DECISIONS #37). The secret key is used for
// this call only and never leaves the server.

import {apiError} from './errors';

export async function deleteAuthUser(userId: string): Promise<void> {
  const {supabaseUrl, supabaseSecretKey} = useRuntimeConfig();
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('NUXT_SUPABASE_URL / NUXT_SUPABASE_SECRET_KEY are not set');
  }

  const response = await fetch(
    `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/admin/users/${userId}`,
    {
      method: 'DELETE',
      headers: {
        apikey: supabaseSecretKey,
        authorization: `Bearer ${supabaseSecretKey}`,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    apiError(502, 'upstreamFailed');
  }
}
