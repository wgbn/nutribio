// i18n + legal parity check (roadmap items 1 and 5, DECISIONS #25/#29).
//
// 1. Every locale catalog has EXACTLY the same key set as the en-GB source of
//    truth, and interpolation placeholders ({{...}}) match.
// 2. Every locale legal catalog has the same documents, the same block
//    structure (types and list lengths), the versions declared in
//    @nutribio/core, and the same visible placeholders ([...] markers).
//
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
const CORE_LEGAL = new URL('../../../packages/core/src/legal.ts', import.meta.url).pathname;

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

/** Visible [MARKERS] used by the legal texts (controller, contact, …). */
function markers(value) {
  return new Set((String(value).match(/\[[A-Z_]+\]/g) ?? []).sort());
}

/** Structural signature of a legal document (block types + list lengths). */
function legalShape(doc) {
  return doc.blocks
    .map((b) => (b.type === 'list' ? `list:${b.items.length}` : b.type))
    .join('|');
}

function allText(doc) {
  return doc.blocks
    .map((b) => (b.type === 'list' ? b.items.join('\n') : b.text))
    .join('\n');
}

const ident = (locale) => `c_${locale.replace(/-/g, '_')}`;

async function bundle(dir, name, imports, exports) {
  const entryPath = join(dir, `${name}.js`);
  writeFileSync(entryPath, `${imports}\n${exports}\n`);
  const outfile = join(dir, `${name}.cjs`);
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  return outfile;
}

function checkCatalogs(catalogs) {
  let failures = 0;
  const flat = Object.fromEntries(LOCALES.map((l) => [l, flatten(catalogs[l])]));
  const refKeys = new Set(flat[REFERENCE].keys());

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
  } else {
    console.log(`i18n check OK: ${LOCALES.length} locales in parity (${total} keys each).`);
  }
  return failures;
}

function checkLegal({docs, ids, versions}) {
  let failures = 0;
  const reference = docs[REFERENCE];
  if (!reference) {
    console.error(`legal check: no ${REFERENCE} catalog`);
    return 1;
  }

  for (const locale of LOCALES) {
    const catalog = docs[locale];
    if (!catalog) {
      failures++;
      console.error(`[${locale}] legal catalog missing`);
      continue;
    }
    for (const id of ids) {
      const doc = catalog[id];
      if (!doc) {
        failures++;
        console.error(`[${locale}] legal document missing: ${id}`);
        continue;
      }
      if (doc.id !== id) {
        failures++;
        console.error(`[${locale}] ${id}: id is "${doc.id}"`);
      }
      if (doc.version !== versions[id]) {
        failures++;
        console.error(
          `[${locale}] ${id}: version "${doc.version}" does not match core "${versions[id]}"`,
        );
      }
      if (!doc.title || !doc.updatedAt || doc.blocks.length === 0) {
        failures++;
        console.error(`[${locale}] ${id}: title/updatedAt/blocks missing`);
      }
      const shape = legalShape(doc);
      const expectedShape = legalShape(reference[id]);
      if (shape !== expectedShape) {
        failures++;
        console.error(`[${locale}] ${id}: block structure differs from ${REFERENCE}`);
        console.error(`  expected: ${expectedShape}`);
        console.error(`  actual:   ${shape}`);
      }
      const expectedMarkers = markers(allText(reference[id]));
      const actualMarkers = markers(allText(doc));
      if (
        expectedMarkers.size !== actualMarkers.size ||
        [...expectedMarkers].some((m) => !actualMarkers.has(m))
      ) {
        failures++;
        console.error(
          `[${locale}] ${id}: placeholder markers differ — expected [${[...expectedMarkers].join(', ')}] got [${[...actualMarkers].join(', ')}]`,
        );
      }
      if (doc.blocks.some((b) => (b.type === 'list' ? b.items.length === 0 : !b.text))) {
        failures++;
        console.error(`[${locale}] ${id}: empty block text/items`);
      }
    }
  }

  if (failures > 0) {
    console.error(`legal check FAILED with ${failures} problem(s) across ${LOCALES.length} locale(s).`);
  } else {
    console.log(
      `legal check OK: ${LOCALES.length} locales × ${ids.length} documents (${ids.map((id) => versions[id]).join('/')}).`,
    );
  }
  return failures;
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'nutribio-i18ncheck-'));

  // 1. UI catalogs.
  const catalogOutfile = await bundle(
    dir,
    'catalogs',
    LOCALES.map((l) => `import ${ident(l)} from '${SRC_ROOT}/i18n/catalogs/${l}';`).join('\n'),
    `export default {${LOCALES.map((l) => `'${l}': ${ident(l)}`).join(',')}};`,
  );

  // 2. Legal texts + the versions declared in core.
  const legalOutfile = await bundle(
    dir,
    'legal',
    [
      ...LOCALES.map((l) => `import ${ident(l)} from '${SRC_ROOT}/legal/${l}';`),
      `import {LEGAL_DOCUMENT_IDS, LEGAL_DOCUMENT_VERSIONS} from '${CORE_LEGAL}';`,
    ].join('\n'),
    `export default {docs: {${LOCALES.map((l) => `'${l}': ${ident(l)}`).join(',')}}, ids: LEGAL_DOCUMENT_IDS, versions: LEGAL_DOCUMENT_VERSIONS};`,
  );

  const require = createRequire(import.meta.url);
  const catalogs = require(catalogOutfile).default;
  const legal = require(legalOutfile).default;
  rmSync(dir, {recursive: true, force: true});

  const failures = checkCatalogs(catalogs) + checkLegal(legal);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
