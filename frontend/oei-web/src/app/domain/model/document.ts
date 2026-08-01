export const SUPPORTED_LANGUAGES = ['fr', 'en', 'de', 'es', 'it', 'pt'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface Document {
  readonly slug: string;
  readonly lang: string;
  readonly title: string;
  readonly body: string;
  /** true si ce document est un repli (ex. anglais servi faute de traduction dans la langue demandée). */
  readonly isFallback: boolean;
}

export function createDocument(fields: Document): Document {
  return Object.freeze({ ...fields });
}
