// Generates the Supabase Auth email templates from `email/strings.mjs`.
//
// Each template is a Go template that picks the language from
// `{{ .Data.locale }}` (user_metadata written by the web app at signup) and
// falls back to en-GB. Run `npm run email:build -w @nutribio/db` after editing
// the copy; the generated HTML is committed because `supabase config push`
// uploads it to the hosted project.
//
// Usage: node scripts/build_email_templates.mjs

import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  EMAIL_LOCALES,
  FALLBACK_LOCALE,
  TEMPLATE_KINDS,
  emailStrings,
} from '../email/strings.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'supabase', 'templates');

/** Renders one localized string as a Go-template conditional chain. */
function t(key) {
  const fallback = emailStrings[FALLBACK_LOCALE][key];
  const branches = EMAIL_LOCALES.filter((locale) => locale !== FALLBACK_LOCALE)
    .map((locale) => {
      const value = emailStrings[locale][key];
      if (typeof value !== 'string' || !value) {
        throw new Error(`Missing "${key}" for locale "${locale}"`);
      }
      return `{{ else if eq .Data.locale "${locale}" }}${value}`;
    })
    .join('');
  return `{{ if eq .Data.locale "${FALLBACK_LOCALE}" }}${fallback}${branches}{{ else }}${fallback}{{ end }}`;
}

function render(kind, keys) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nutribio</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8f7;color:#1f2937;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8f7;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:-0.01em;color:#059669;">Nutribio</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;font-size:15px;line-height:1.55;">
                <p style="margin:0 0 12px 0;">${t('hello')}</p>
                <p style="margin:0 0 20px 0;">${t(keys.intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">${t('codeLabel')}</p>
                <p style="margin:0 0 8px 0;font-size:32px;font-weight:700;letter-spacing:0.18em;color:#111827;">{{ .Token }}</p>
                <p style="margin:0 0 20px 0;font-size:13px;color:#6b7280;">${t('expiry')}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 4px 32px;font-size:15px;line-height:1.55;">
                <p style="margin:0 0 10px 0;color:#6b7280;">${t('linkFallback')}</p>
                <p style="margin:0 0 24px 0;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:10px;">${t('linkLabel')}</a>
                </p>
                <p style="margin:0 0 24px 0;font-size:13px;color:#6b7280;">${t(keys.ignore)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px 0;" />
                <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">${t('footer')}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

// Fail fast on copy gaps before writing anything.
for (const locale of EMAIL_LOCALES) {
  const strings = emailStrings[locale];
  if (!strings) throw new Error(`Missing strings for locale "${locale}"`);
  for (const kind of Object.values(TEMPLATE_KINDS)) {
    for (const key of ['hello', 'codeLabel', 'expiry', 'linkFallback', 'linkLabel', 'footer', kind.intro, kind.ignore]) {
      if (typeof strings[key] !== 'string' || !strings[key]) {
        throw new Error(`Missing "${key}" for locale "${locale}"`);
      }
    }
  }
}

await mkdir(outDir, {recursive: true});
for (const [kind, keys] of Object.entries(TEMPLATE_KINDS)) {
  const file = join(outDir, `${kind}.html`);
  await writeFile(file, render(kind, keys), 'utf8');
  console.log(`wrote ${file}`);
}
console.log(`templates: ${Object.keys(TEMPLATE_KINDS).length} × ${EMAIL_LOCALES.length} locales`);
