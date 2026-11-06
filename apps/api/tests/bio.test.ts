// Bioimpedance history: dedupe by date (replace semantics), latest fallback
// and validation.

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {call, createUser, deleteUser, type TestUser} from './support';

interface Biometrics {
  latest: {date: string; [key: string]: unknown} | null;
  history: {date: string; [key: string]: unknown}[];
}

let user: TestUser;

beforeAll(async () => {
  user = await createUser();
});

afterAll(async () => {
  await deleteUser(user);
});

describe('bio records', () => {
  it('starts empty', async () => {
    const response = await call<Biometrics>('/api/bio', {token: user.token});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({latest: null, history: []});
  });

  it('creates a measurement', async () => {
    const response = await call<Biometrics>('/api/bio/2026-11-01', {
      method: 'PUT',
      token: user.token,
      body: {weight: 72.5, bodyFat: 31.2, water: 48, bmr: 1420},
    });
    expect(response.status).toBe(200);
    expect(response.body.latest).toEqual({
      date: '2026-11-01',
      weight: 72.5,
      bodyFat: 31.2,
      water: 48,
      bmr: 1420,
    });
  });

  it('replaces the same date instead of duplicating it', async () => {
    const response = await call<Biometrics>('/api/bio/2026-11-01', {
      method: 'PUT',
      token: user.token,
      body: {weight: 71.9},
    });
    expect(response.status).toBe(200);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0]).toEqual({date: '2026-11-01', weight: 71.9});
  });

  it('keeps history ascending and latest = newest date', async () => {
    const response = await call<Biometrics>('/api/bio/2026-11-05', {
      method: 'PUT',
      token: user.token,
      body: {weight: 71.4, bodyFat: 30.8},
    });
    expect(response.status).toBe(200);
    expect(response.body.history.map((record) => record.date)).toEqual(['2026-11-01', '2026-11-05']);
    expect(response.body.latest?.date).toBe('2026-11-05');
  });

  it('rejects impossible dates and out-of-range metrics', async () => {
    const badDate = await call('/api/bio/2026-02-30', {
      method: 'PUT',
      token: user.token,
      body: {weight: 70},
    });
    expect(badDate.status).toBe(400);

    const future = await call('/api/bio/2099-01-01', {
      method: 'PUT',
      token: user.token,
      body: {weight: 70},
    });
    expect(future.status).toBe(400);

    const badMetric = await call('/api/bio/2026-11-06', {
      method: 'PUT',
      token: user.token,
      body: {bodyFat: 90},
    });
    expect(badMetric.status).toBe(400);
  });

  it('deletes a measurement and falls back to the newest remaining one', async () => {
    const response = await call<Biometrics>('/api/bio/2026-11-05', {
      method: 'DELETE',
      token: user.token,
    });
    expect(response.status).toBe(200);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.latest?.date).toBe('2026-11-01');
  });

  it('returns bioRecordNotFound when the date does not exist', async () => {
    const response = await call('/api/bio/2020-01-01', {method: 'DELETE', token: user.token});
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: {code: 'bioRecordNotFound'}});
  });
});
