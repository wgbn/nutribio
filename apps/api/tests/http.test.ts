// HTTP contract: health, 404s, CORS allow-list, token verification and the
// request-body ceiling (DECISIONS #44).

import {SignJWT, generateKeyPair} from 'jose';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {call, createUser, deleteUser, profileBody, runtime, type TestUser} from './support';

let user: TestUser;

beforeAll(async () => {
  user = await createUser();
});

afterAll(async () => {
  await deleteUser(user);
});

describe('health', () => {
  it('answers without authentication', async () => {
    const response = await call('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({status: 'ok', db: 'ok'});
  });
});

describe('unknown paths', () => {
  it('returns the error contract outside /api', async () => {
    const response = await call('/');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: {code: 'notFound'}});
  });

  it('returns the error contract for unknown API routes', async () => {
    const response = await call('/api/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: {code: 'notFound'}});
  });
});

describe('CORS', () => {
  it('echoes an allowed origin', async () => {
    const response = await call('/api/health', {headers: {origin: 'http://localhost:5173'}});
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(response.headers.get('vary')).toBe('Origin');
  });

  it('ignores an unknown origin', async () => {
    const response = await call('/api/health', {headers: {origin: 'https://evil.example'}});
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('answers the preflight with the allowed methods and headers', async () => {
    const response = await call('/api/profile', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'PUT',
        'access-control-request-headers': 'authorization,content-type',
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-methods')).toContain('PUT');
    expect(response.headers.get('access-control-allow-headers')).toContain('authorization');
  });
});

describe('access tokens', () => {
  it('rejects a request without a token', async () => {
    const response = await call('/api/profile');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({error: {code: 'unauthorized'}});
  });

  it('rejects a malformed token', async () => {
    const response = await call('/api/profile', {token: 'not-a-jwt'});
    expect(response.status).toBe(401);
  });

  it('rejects a token signed by another key', async () => {
    const {privateKey} = await generateKeyPair('ES256');
    const forged = await new SignJWT({role: 'authenticated'})
      .setProtectedHeader({alg: 'ES256'})
      .setIssuer(`${runtime.supabaseUrl}/auth/v1`)
      .setAudience('authenticated')
      .setSubject(user.id)
      .setExpirationTime('1h')
      .sign(privateKey);

    const response = await call('/api/profile', {token: forged});
    expect(response.status).toBe(401);
  });

  it('rejects a token with the wrong audience', async () => {
    const {privateKey} = await generateKeyPair('ES256');
    const forged = await new SignJWT({role: 'authenticated'})
      .setProtectedHeader({alg: 'ES256'})
      .setIssuer(`${runtime.supabaseUrl}/auth/v1`)
      .setAudience('anon')
      .setSubject(user.id)
      .setExpirationTime('1h')
      .sign(privateKey);

    const response = await call('/api/profile', {token: forged});
    expect(response.status).toBe(401);
  });

  it('rejects a tampered real token', async () => {
    const [header, payload, signature] = user.token.split('.');
    const flipped = `${header}.${payload}.${signature!.slice(0, -2)}${signature!.endsWith('A') ? 'BB' : 'AA'}`;
    const response = await call('/api/profile', {token: flipped});
    expect(response.status).toBe(401);
  });

  it('accepts a valid token', async () => {
    const response = await call('/api/account', {token: user.token});
    expect(response.status).toBe(200);
    expect((response.body as {id: string}).id).toBe(user.id);
  });
});

describe('body limit', () => {
  it('rejects payloads over 16 KB', async () => {
    const response = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      headers: {'content-type': 'application/json'},
      body: {profile: profileBody(), padding: 'x'.repeat(20_000)},
    });
    expect(response.status).toBe(413);
    expect(response.body).toEqual({error: {code: 'payloadTooLarge'}});
  });
});
