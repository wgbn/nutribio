// Account summary, data export, per-user isolation and account deletion
// (cascade from `auth.users`, Item 5.4).

import {createDb} from '@nutribio/db';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
  PASSWORD,
  call,
  createUser,
  deleteUser,
  profileBody,
  profileFixture,
  runtime,
  type TestUser,
} from './support';

interface ExportBody {
  formatVersion: number;
  exportedAt: string;
  account: {id: string; email: string | null};
  profile: Record<string, unknown> | null;
  profileHistory: unknown[];
  bioRecords: {date: string}[];
  plans: unknown[];
  consents: unknown[];
}

let user: TestUser;

const {client} = createDb(runtime.databaseUrl);

async function countRows(table: string, userId: string): Promise<number> {
  const rows = await client.unsafe<{count: number}[]>(
    `select count(*)::int as count from app.${table} where user_id = $1`,
    [userId],
  );
  return rows[0]?.count ?? -1;
}

beforeAll(async () => {
  user = await createUser();
  await call('/api/profile', {method: 'PUT', token: user.token, body: profileBody()});
  await call('/api/bio/2026-11-01', {
    method: 'PUT',
    token: user.token,
    body: {weight: 72.5, bodyFat: 31.2},
  });
});

afterAll(async () => {
  await deleteUser(user);
  await client.end({timeout: 5});
});

describe('account summary', () => {
  it('reports the user and whether a profile exists', async () => {
    const response = await call<{id: string; email: string; hasProfile: boolean}>('/api/account', {
      token: user.token,
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({id: user.id, email: user.email, hasProfile: true});
  });
});

describe('data export', () => {
  it('returns every section of the account', async () => {
    const response = await call<ExportBody>('/api/account/export', {token: user.token});
    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('attachment; filename="nutribio-export-');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.body.formatVersion).toBe(1);
    expect(response.body.account).toEqual({id: user.id, email: user.email});
    expect(response.body.profile).toMatchObject(profileFixture());
    expect(response.body.bioRecords).toHaveLength(1);
    expect(response.body.plans).toEqual([]);
    expect(response.body.consents).toEqual([]);
  });
});

describe('isolation', () => {
  it('never exposes another user\'s data', async () => {
    const other = await createUser('en-GB');
    try {
      const profile = await call('/api/profile', {token: other.token});
      expect(profile.status).toBe(404);

      const bio = await call<{history: unknown[]}>('/api/bio', {token: other.token});
      expect(bio.body.history).toEqual([]);

      const exported = await call<ExportBody>('/api/account/export', {token: other.token});
      expect(exported.body.profile).toBeNull();
      expect(exported.body.bioRecords).toEqual([]);
    } finally {
      await deleteUser(other);
    }
  });
});

describe('account deletion', () => {
  it('requires an explicit confirmation', async () => {
    const response = await call('/api/account', {
      method: 'DELETE',
      token: user.token,
      body: {},
    });
    expect(response.status).toBe(400);
  });

  it('deletes the account and every owned row', async () => {
    const doomed = await createUser();
    await call('/api/profile', {method: 'PUT', token: doomed.token, body: profileBody()});
    await call('/api/profile', {
      method: 'PUT',
      token: doomed.token,
      body: profileBody({name: 'Changed'}),
    });
    await call('/api/bio/2026-11-02', {method: 'PUT', token: doomed.token, body: {weight: 70}});

    const deletion = await call('/api/account', {
      method: 'DELETE',
      token: doomed.token,
      body: {confirm: true},
    });
    expect(deletion.status).toBe(204);

    expect(await countRows('profiles', doomed.id)).toBe(0);
    expect(await countRows('profile_history', doomed.id)).toBe(0);
    expect(await countRows('bio_records', doomed.id)).toBe(0);

    const admin = await fetch(`${runtime.supabaseUrl}/auth/v1/admin/users/${doomed.id}`, {
      headers: {
        apikey: runtime.serviceKey,
        authorization: `Bearer ${runtime.serviceKey}`,
      },
    });
    expect(admin.status).toBe(404);

    const reuse = await call('/api/profile', {
      method: 'PUT',
      token: doomed.token,
      body: profileBody(),
    });
    expect(reuse.status).toBe(401);
    expect(reuse.body).toEqual({error: {code: 'accountNotFound'}});
  });

  it('still signs in with the documented password policy', async () => {
    const signIn = await fetch(`${runtime.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {apikey: runtime.serviceKey, 'content-type': 'application/json'},
      body: JSON.stringify({email: user.email, password: PASSWORD}),
    });
    expect(signIn.status).toBe(200);
  });
});
