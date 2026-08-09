/**
 * Redaction rules for anything that must never reach a console/JSON log line: OAuth
 * tokens, passwords/secrets, and full CV/profile bodies (see
 * `.prompt/plan/final/00-AWS-DEPLOYMENT-AND-DEVOPS-PROMPT.md`, "Logs": *"Ne jamais logger
 * tokens, mots de passe, CV complets ou secrets."*).
 *
 * Two complementary strategies, applied recursively to any plain object/array:
 * 1. Key-based: a field whose *name* matches a known-sensitive pattern (token, password,
 *    secret, authorization, cv, resume, profile body, ...) is replaced outright, whatever
 *    its value.
 * 2. Value-based: even under an innocuous key, a string that *looks like* a JWT
 *    (`xxx.yyy.zzz` base64url segments) or that is long enough to plausibly be a full
 *    CV/cover-letter/profile body is redacted/truncated too — key-based filtering alone
 *    would miss a token or CV text stored under a generic key such as `value` or `data`.
 */

/** Field names that must never be logged, matched case-insensitively as a whole or substring. */
const SENSITIVE_KEY_PATTERNS: readonly RegExp[] = [
  /token/i,
  /password/i,
  /passwd/i,
  /secret/i,
  /authorization/i,
  /^auth$/i,
  /credential/i,
  /\bcv\b/i,
  /curriculum/i,
  /resume/i,
  /coverletter/i,
  /profilebody/i,
  /fullprofile/i,
];

/** A JWT-shaped string: three base64url segments separated by dots. */
const JWT_LIKE_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** Above this length a string is truncated rather than logged verbatim (e.g. a CV body). */
const MAX_STRING_LENGTH = 300;

export const REDACTED = '[REDACTED]';

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function redactString(value: string): string {
  if (JWT_LIKE_PATTERN.test(value)) {
    return REDACTED;
  }
  if (value.length > MAX_STRING_LENGTH) {
    return `[TRUNCATED ${value.length} chars]`;
  }
  return value;
}

/**
 * Deep-clones `value` while redacting sensitive keys/values. Safe to call on `undefined`,
 * primitives, arrays, `FormData`, or arbitrary nested objects (e.g. HTTP request/response
 * bodies) — anything that is not a plain redactable object/array/string is returned as-is.
 */
export function redactSensitiveData(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item));
  }
  if (value !== null && typeof value === 'object' && value.constructor === Object) {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      result[key] = isSensitiveKey(key) ? REDACTED : redactSensitiveData(source[key]);
    }
    return result;
  }
  // Non-plain objects (FormData, File, Blob, class instances, Date, ...) are not walked —
  // they are logged as an opaque marker rather than risk leaking their content.
  if (value !== null && typeof value === 'object') {
    return `[${value.constructor?.name ?? 'object'}]`;
  }
  return value;
}
