// Error contract of the API (DECISIONS #44): every failure is a machine code,
// never a translated string (same principle as the core `PlanParseError`
// codes). The web app maps the codes to i18n keys from phase 4.6 onwards.

export type ApiErrorCode =
  | 'unauthorized'
  | 'accountNotFound'
  | 'validationFailed'
  | 'notFound'
  | 'profileNotFound'
  | 'bioRecordNotFound'
  | 'conflict'
  | 'payloadTooLarge'
  | 'upstreamFailed'
  | 'internal';

export interface ApiIssue {
  path: string;
  code: string;
}

export interface ApiErrorBody {
  error: {code: ApiErrorCode; issues?: ApiIssue[]};
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly issues?: ApiIssue[];

  constructor(status: number, code: ApiErrorCode, issues?: ApiIssue[]) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

/** Throws an `ApiError` — the only way routes report a failure. */
export function apiError(
  status: number,
  code: ApiErrorCode,
  issues?: ApiIssue[],
): never {
  throw new ApiError(status, code, issues);
}

/**
 * Postgres SQLSTATE behind an error (drizzle may wrap the driver error), used
 * to translate database failures into the API contract.
 */
export function findPgCode(error: unknown, depth = 0): string | undefined {
  if (!error || typeof error !== 'object' || depth > 5) return undefined;
  const candidate = error as {code?: unknown; cause?: unknown};
  if (typeof candidate.code === 'string' && /^[0-9A-Z]{5}$/.test(candidate.code)) {
    return candidate.code;
  }
  return findPgCode(candidate.cause, depth + 1);
}

/**
 * Normalizes anything thrown by a route into status + body. Database codes are
 * mapped explicitly so a deleted account (foreign-key violation, 23503) is not
 * reported as a server error.
 */
export function normalizeError(error: unknown): {status: number; body: ApiErrorBody} {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {error: {code: error.code, ...(error.issues ? {issues: error.issues} : {})}},
    };
  }

  switch (findPgCode(error)) {
    case '23503':
      return {status: 401, body: {error: {code: 'accountNotFound'}}};
    case '23505':
      return {status: 409, body: {error: {code: 'conflict'}}};
    case '23502':
    case '23514':
    case '22P02':
      return {status: 400, body: {error: {code: 'validationFailed'}}};
    default:
      return {status: 500, body: {error: {code: 'internal'}}};
  }
}
