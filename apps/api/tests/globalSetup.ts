// Integration-test bootstrap (DECISIONS #45).
//
// 1. Reads the local Supabase stack (URLs + keys) from the CLI.
// 2. Builds the API and starts the built Nitro server on a free port.
// 3. Waits for `/api/health` and writes the runtime config to a temp file the
//    test files read (workers do not inherit `process.env` changes made here).
//
// Requires the local stack: `npm run db:start -w @nutribio/db`.

import {execFileSync, spawn, type ChildProcess} from 'node:child_process';
import {rmSync, writeFileSync} from 'node:fs';
import {createServer} from 'node:net';
import {tmpdir} from 'node:os';
import path from 'node:path';

const API_ROOT = path.resolve(import.meta.dirname, '..');
const DB_ROOT = path.resolve(API_ROOT, '../../packages/db');
export const RUNTIME_FILE = path.join(tmpdir(), 'nutribio-api-test-runtime.json');

export interface TestRuntime {
  baseUrl: string;
  supabaseUrl: string;
  serviceKey: string;
  databaseUrl: string;
}

function readStackEnv(): Record<string, string> {
  let output: string;
  try {
    output = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
      cwd: DB_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    throw new Error(
      'Local Supabase stack is not running. Start it with: npm run db:start -w @nutribio/db',
    );
  }

  const env: Record<string, string> = {};
  for (const line of output.split('\n')) {
    const match = /^([A-Z0-9_]+)="?(.*?)"?$/.exec(line.trim());
    if (match) env[match[1]!] = match[2]!;
  }
  return env;
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => (port ? resolve(port) : reject(new Error('no free port'))));
    });
  });
}

async function waitForHealth(baseUrl: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`API did not become healthy at ${baseUrl}`);
}

export default async function setup() {
  const stack = readStackEnv();
  const supabaseUrl = stack.API_URL;
  const serviceKey = stack.SECRET_KEY;
  const databaseUrl = stack.DB_URL;
  if (!supabaseUrl || !serviceKey || !databaseUrl) {
    throw new Error('Could not read API_URL / SECRET_KEY / DB_URL from the local Supabase stack');
  }

  // The API verifies ES256 tokens through the JWKS endpoint, so the local
  // stack must sign with the generated signing key (DECISIONS #45).
  const jwks = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
    .then((response) => response.json())
    .catch(() => ({keys: []})) as {keys?: unknown[]};
  if (!jwks.keys?.length) {
    throw new Error(
      'The local stack has no JWT signing key. Run `npm run auth:signing-key -w @nutribio/db` and restart it (db:stop + db:start).',
    );
  }

  if (!process.env.API_TEST_SKIP_BUILD) {
    execFileSync('npm', ['run', 'build'], {cwd: API_ROOT, stdio: 'inherit'});
  }

  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server: ChildProcess = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: API_ROOT,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
      NUXT_SUPABASE_URL: supabaseUrl,
      NUXT_SUPABASE_SECRET_KEY: serviceKey,
      NUXT_DATABASE_URL: databaseUrl,
      NUXT_CORS_ORIGINS: 'http://localhost:5173,https://nbio.loca.lt',
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  const runtime: TestRuntime = {baseUrl, supabaseUrl, serviceKey, databaseUrl};
  writeFileSync(RUNTIME_FILE, JSON.stringify(runtime, null, 2));

  try {
    await waitForHealth(baseUrl);
  } catch (error) {
    server.kill('SIGKILL');
    throw error;
  }

  return async () => {
    server.kill('SIGTERM');
    rmSync(RUNTIME_FILE, {force: true});
  };
}
