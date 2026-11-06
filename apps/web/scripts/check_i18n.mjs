// i18n catalog parity check (roadmap item 1, DECISIONS #25).
// Verifies that every locale catalog has EXACTLY the same key set as the
// en-GB source of truth, and that interpolation placeholders ({{...}}) match.
// Exits non-zero on any mismatch. Run via `npm run i18n:check` (also chained
// into `npm run build`).

import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';

import {build} from 'esbuild';

const LOCALES = ['en-GB', 'pt-PT', 'pt-BR', 'es', 'fr', 'de', 'it'];
const REFERENCE = 'en-GB';
const SRC_ROOT = new URL('../src', import.meta.url).pathname;

function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out.set(path, String(value));
    }
  }
  return out;
}

function placeholders(value) {
  return new Set((String(value).match(/\{\{(\w+)\}\}/g) ?? []).sort());
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'nutribio-i18ncheck-'));
  const entryPath = join(dir, 'entry.js');
  const imports = LOCALES.map((l) => `import c_${l.replace(/-/g, '_')} from '${SRC_ROOT}/i18n/catalogs/${l}';`).join('\n');
  const exports = `export default {${LOCALES.map((l) => `'${l}': c_${l.replace(/-/g, '_')}`).join(',')}};`;
  writeFileSync(entryPath, `${imports}\n${exports}\n`);

  const outfile = join(dir, 'bundle.cjs');
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });

  const require = createRequire(import.meta.url);
  const catalogs = require(outfile).default;
  rmSync(dir, {recursive: true, force: true});

  const flat = Object.fromEntries(LOCALES.map((l) => [l, flatten(catalogs[l])]));
  const refKeys = new Set(flat[REFERENCE].keys());

  let failures = 0;
  for (const locale of LOCALES) {
    if (locale === REFERENCE) continue;
    const keys = new Set(flat[locale].keys());
    const missing = [...refKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refKeys.has(k));
    if (missing.length > 0) {
      failures += missing.length;
      console.error(`[${locale}] missing keys (${missing.length}):`);
      for (const k of missing) console.error(`  - ${k}`);
    }
    if (extra.length > 0) {
      failures += extra.length;
      console.error(`[${locale}] extra keys not in ${REFERENCE} (${extra.length}):`);
      for (const k of extra) console.error(`  - ${k}`);
    }
    // Interpolation placeholders must match the reference.
    for (const key of refKeys) {
      if (!keys.has(key)) continue;
      const expected = placeholders(flat[REFERENCE].get(key));
      const actual = placeholders(flat[locale].get(key));
      if (expected.size !== actual.size || [...expected].some((v) => !actual.has(v))) {
        failures++;
        console.error(`[${locale}] placeholder mismatch at "${key}": expected {${[...expected].join(', ')}} got {${[...actual].join(', ')}}`);
      }
    }
  }

  const total = refKeys.size;
  if (failures > 0) {
    console.error(`i18n check FAILED with ${failures} problem(s) across ${LOCALES.length - 1} locale(s) (${total} reference keys).`);
    process.exit(1);
  }
  console.log(`i18n check OK: ${LOCALES.length} locales in parity (${total} keys each).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
