// CORS allow-list (DECISIONS #44).
//
// Only the origins listed in NUXT_CORS_ORIGINS may call the API from a
// browser (GitHub Pages site, local Vite dev server, the owner's tunnel).
// Unknown origins get no CORS headers, so the browser blocks the response.

const ALLOWED_HEADERS = 'authorization, content-type';
const ALLOWED_METHODS = 'GET, PUT, DELETE, OPTIONS';
const EXPOSED_HEADERS = 'content-disposition';

let allowedOrigins: string[] | null = null;
let allowedOriginsSource = '';

function getAllowedOrigins(): string[] {
  const {corsOrigins} = useRuntimeConfig();
  if (!allowedOrigins || allowedOriginsSource !== corsOrigins) {
    allowedOrigins = corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    allowedOriginsSource = corsOrigins;
  }
  return allowedOrigins;
}

export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin');
  if (origin && getAllowedOrigins().includes(origin)) {
    setResponseHeader(event, 'access-control-allow-origin', origin);
    setResponseHeader(event, 'vary', 'Origin');
    setResponseHeader(event, 'access-control-allow-headers', ALLOWED_HEADERS);
    setResponseHeader(event, 'access-control-allow-methods', ALLOWED_METHODS);
    setResponseHeader(event, 'access-control-expose-headers', EXPOSED_HEADERS);
    setResponseHeader(event, 'access-control-max-age', '600');
  }

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204);
    return '';
  }
});
