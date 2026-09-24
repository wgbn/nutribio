// Readable error description helper, shared by the Gemini flows so the real
// API error (e.g. "400 INVALID_ARGUMENT: API key not valid") is shown to the
// user instead of a generic message.

/** Try to pull "{code} {status}: {message}" out of an API JSON error body. */
function extractApiMessage(text: string): string | null {
  try {
    const parsed = JSON.parse(text) as {error?: {code?: unknown; message?: unknown; status?: unknown}};
    const err = parsed?.error;
    if (!err || typeof err.message !== 'string' || !err.message) return null;
    const code = typeof err.code === 'number' ? String(err.code) : '';
    const status = typeof err.status === 'string' ? err.status : '';
    const prefix = [code, status].filter(Boolean).join(' ');
    return prefix ? `${prefix}: ${err.message}` : err.message;
  } catch {
    return null;
  }
}

export function describeError(err: unknown): string {
  if (err instanceof Error && err.message) {
    // The SDK embeds the API JSON body in Error.message.
    return extractApiMessage(err.message) ?? err.message;
  }
  if (err && typeof err === 'object') {
    const e = err as {message?: unknown; status?: unknown; code?: unknown};
    if (typeof e.message === 'string' && e.message) return e.message;
    if (typeof e.status === 'number' && typeof e.code === 'string') {
      return `${e.status} ${e.code}`;
    }
  }
  return String(err);
}
