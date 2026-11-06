// Request body size limit (DECISIONS #44).
//
// Profiles and bio records are a few hundred bytes; the free-text fields are
// already capped by the validation schemas. A hard 16 KB ceiling keeps the
// prompt-injection / memory surface small without affecting real payloads.

const MAX_BODY_BYTES = 16 * 1024;

export default defineEventHandler((event) => {
  const length = Number(getHeader(event, 'content-length') ?? 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    setResponseStatus(event, 413);
    setResponseHeader(event, 'content-type', 'application/json; charset=utf-8');
    return {error: {code: 'payloadTooLarge'}};
  }
});
