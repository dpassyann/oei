// Content types supported by the CMS, exactly mirroring `ContentType` in `openapi/oei-api.yaml`
// and the "Types" section of `.prompt/plan/04-PROMPT-CMS-GOUVERNANCE-DOCUMENTAIRE.md`.
export const CONTENT_TYPES = [
  'PAGE',
  'ARTICLE',
  'NEWS',
  'EVENT',
  'WHITEPAPER',
  'MANIFESTO',
  'GLOSSARY',
  'STATUTES',
  'REGULATION',
  'ETHICS_CODE',
  'COMPETENCY_FRAMEWORK',
  'CHARTER',
  'REPORT',
  'BOOK',
  'PRESS_RELEASE',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (CONTENT_TYPES as readonly string[]).includes(value.toUpperCase());
}

/** Normative document types whose source of truth is Git+Markdown, never the CMS editor. */
export const NORMATIVE_CONTENT_TYPES: readonly ContentType[] = [
  'STATUTES',
  'REGULATION',
  'ETHICS_CODE',
  'COMPETENCY_FRAMEWORK',
  'GLOSSARY',
  'WHITEPAPER',
  'CHARTER',
];

export function isNormativeContentType(type: ContentType): boolean {
  return NORMATIVE_CONTENT_TYPES.includes(type);
}
