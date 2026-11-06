// Profile CRUD, validation and the change history.

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {call, createUser, deleteUser, profileBody, profileFixture, type TestUser} from './support';

let user: TestUser;

beforeAll(async () => {
  user = await createUser();
});

afterAll(async () => {
  await deleteUser(user);
});

describe('profile', () => {
  it('reports profileNotFound before the first write', async () => {
    const response = await call('/api/profile', {token: user.token});
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: {code: 'profileNotFound'}});
  });

  it('creates the profile and returns every field', async () => {
    const response = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: profileBody(),
    });
    expect(response.status).toBe(200);
    const body = response.body as Record<string, unknown> & {updatedAt: number};
    expect(body).toMatchObject(profileFixture());
    expect(typeof body.updatedAt).toBe('number');
  });

  it('reads the stored profile back unchanged', async () => {
    const response = await call('/api/profile', {token: user.token});
    expect(response.status).toBe(200);
    const {updatedAt: _updatedAt, ...rest} = response.body as Record<string, unknown>;
    expect(rest).toMatchObject(profileFixture());
  });

  it('snapshots the previous state when something changes', async () => {
    const update = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: profileBody({name: 'Beatriz', excludedFoods: ''}),
    });
    expect(update.status).toBe(200);

    const history = await call<{items: {snapshot: Record<string, unknown>}[]}>(
      '/api/profile/history',
      {token: user.token},
    );
    expect(history.status).toBe(200);
    expect(history.body.items).toHaveLength(1);
    expect(history.body.items[0]!.snapshot).toMatchObject({name: 'Ana', excludedFoods: 'lactose'});
  });

  it('does not snapshot an identical write', async () => {
    const update = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: profileBody({name: 'Beatriz', excludedFoods: ''}),
    });
    expect(update.status).toBe(200);

    const history = await call<{items: unknown[]}>('/api/profile/history', {token: user.token});
    expect(history.body.items).toHaveLength(1);
  });

  it('honours the history limit parameter', async () => {
    await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: profileBody({name: 'Carla', excludedFoods: ''}),
    });
    const history = await call<{items: unknown[]}>('/api/profile/history?limit=1', {
      token: user.token,
    });
    expect(history.body.items).toHaveLength(1);

    const invalid = await call('/api/profile/history?limit=500', {token: user.token});
    expect(invalid.status).toBe(400);
  });

  it('rejects invalid profiles', async () => {
    const cases: [string, Record<string, unknown>][] = [
      ['under 18', {age: 17}],
      ['unknown country', {country: 'US'}],
      ['excluded foods too long', {excludedFoods: 'x'.repeat(1001)}],
      ['observations too long', {observations: 'x'.repeat(2001)}],
      ['height out of range', {height: 260}],
      ['invalid workout time', {exercise: {...profileFixture().exercise, workoutTime: '25:00'}}],
    ];

    for (const [label, overrides] of cases) {
      const response = await call('/api/profile', {
        method: 'PUT',
        token: user.token,
        body: profileBody(overrides),
      });
      expect(response.status, label).toBe(400);
      expect((response.body as {error: {code: string}}).error.code, label).toBe('validationFailed');
    }
  });

  it('requires every carried-through field', async () => {
    const {supplements: _supplements, ...withoutSupplements} = profileFixture();
    const missing = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: {profile: withoutSupplements, locale: 'pt-PT'},
    });
    expect(missing.status).toBe(400);

    const extra = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: {...profileBody(), extra: true},
    });
    expect(extra.status).toBe(400);

    const badLocale = await call('/api/profile', {
      method: 'PUT',
      token: user.token,
      body: {...profileBody(), locale: 'xx-XX'},
    });
    expect(badLocale.status).toBe(400);
  });
});
