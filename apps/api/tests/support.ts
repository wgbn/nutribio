// Shared helpers for the integration suite: runtime config, user fixtures and
// a thin HTTP client against the running API.

import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import type {TestRuntime} from './globalSetup';
import {RUNTIME_FILE} from './globalSetup';

export const runtime: TestRuntime = JSON.parse(readFileSync(RUNTIME_FILE, 'utf8')) as TestRuntime;

export const PASSWORD = 'Nutribio123';

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
  headers: Headers;
}

async function supabase(path: string, init: RequestInit & {key?: string} = {}) {
  const key = init.key ?? runtime.serviceKey;
  return fetch(`${runtime.supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

/** Creates a confirmed user through the local Admin API and signs it in. */
export async function createUser(locale = 'pt-PT'): Promise<TestUser> {
  const email = `it-${randomUUID()}@nutribio.test`;
  const created = await supabase('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({email, password: PASSWORD, email_confirm: true, user_metadata: {locale}}),
  });
  if (!created.ok) throw new Error(`admin create failed: ${created.status} ${await created.text()}`);
  const {id} = (await created.json()) as {id: string};

  const tokenResponse = await supabase('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({email, password: PASSWORD}),
  });
  if (!tokenResponse.ok) throw new Error(`sign-in failed: ${tokenResponse.status}`);
  const {access_token: token} = (await tokenResponse.json()) as {access_token: string};

  return {id, email, token};
}

export async function deleteUser(user: TestUser): Promise<void> {
  await supabase(`/auth/v1/admin/users/${user.id}`, {method: 'DELETE'});
}

/** Calls the API (JSON in, JSON out). */
export async function call<T = unknown>(
  path: string,
  options: {method?: string; token?: string; body?: unknown; headers?: Record<string, string>} = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${runtime.baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.token ? {authorization: `Bearer ${options.token}`} : {}),
      ...(options.body === undefined ? {} : {'content-type': 'application/json'}),
      ...(options.headers ?? {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return {status: response.status, body: body as T, headers: response.headers};
}

export function profileFixture(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Ana',
    sex: 'female',
    age: 34,
    height: 168,
    initialWeight: 72.5,
    goal: 'lose_fat',
    country: 'PT',
    exercise: {
      active: true,
      frequency: '3_4',
      intensity: 'moderate',
      type: 'mixed',
      workoutTime: '18:30',
    },
    supplements: {wheyProtein: true, creatine: false},
    excludedFoods: 'lactose',
    observations: 'sem fritos',
    ...overrides,
  };
}

export function profileBody(overrides: Record<string, unknown> = {}) {
  return {profile: profileFixture(overrides), locale: 'pt-PT'};
}
