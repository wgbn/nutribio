// Access-token verification (DECISIONS #40).
//
// Supabase signs the tokens with asymmetric keys (ES256), so the API verifies
// them against the project's public JWKS instead of holding a shared secret.
// `jose` caches the key set and refetches it when an unknown `kid` shows up
// (transparent key rotation).

import type {H3Event} from 'h3';
import {createRemoteJWKSet, jwtVerify, type JWTPayload} from 'jose';
import {apiError} from './errors';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuthUser {
  id: string;
  email: string | null;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksBaseUrl = '';

function getJwks(baseUrl: string) {
  if (!jwks || jwksBaseUrl !== baseUrl) {
    jwks = createRemoteJWKSet(new URL(`${baseUrl}/auth/v1/.well-known/jwks.json`));
    jwksBaseUrl = baseUrl;
  }
  return jwks;
}

function readToken(event: H3Event): string {
  const header = getHeader(event, 'authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) apiError(401, 'unauthorized');
  return token;
}

/** Returns the authenticated user or throws `401 unauthorized`. */
export async function requireUser(event: H3Event): Promise<AuthUser> {
  const token = readToken(event);
  const {supabaseUrl} = useRuntimeConfig();
  if (!supabaseUrl) throw new Error('NUXT_SUPABASE_URL is not set');

  const baseUrl = supabaseUrl.replace(/\/+$/, '');
  let payload: JWTPayload;
  try {
    ({payload} = await jwtVerify(token, getJwks(baseUrl), {
      issuer: `${baseUrl}/auth/v1`,
      audience: 'authenticated',
      algorithms: ['ES256'],
    }));
  } catch {
    apiError(401, 'unauthorized');
  }

  if (payload.role !== 'authenticated' || typeof payload.sub !== 'string' || !UUID_RE.test(payload.sub)) {
    apiError(401, 'unauthorized');
  }

  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : null,
  };
}
