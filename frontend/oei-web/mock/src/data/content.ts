/**
 * Fixture data for the /api/v1/content/:lang/:slug mock route.
 *
 * Shape mirrors `ContentDocument` from `openapi/oei-api.yaml`
 * (slug, lang, title, body, isFallback).
 *
 * Keep this in sync with the in-app fallback fixtures in
 * `src/app/infrastructure/adapter/content-mock.adapter.ts` so the two mock
 * layers (in-app mock adapter vs. this standalone HTTP server) behave
 * identically for the same slug/lang combination.
 */
export interface ContentFixture {
  readonly title: string;
  readonly body: string;
}

/** slug -> lang -> fixture */
export const CONTENT_FIXTURES: Record<string, Record<string, ContentFixture>> = {
  home: {
    fr: {
      title: 'Nous construisons la confiance numérique de demain.',
      body: "Éthique. Compétence. Responsabilité. Pour une informatique au service de l'humain et de la société.",
    },
    en: {
      title: "We are building tomorrow's digital trust.",
      body: 'Ethics. Competence. Responsibility. For technology that serves people and society.',
    },
  },
};
