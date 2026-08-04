// The seven publication categories required by the product spec (article, communiqué,
// livre blanc, rapport, événement, consultation, appel à contribution) — kept as a
// structural union (not a free string) so the presentation layer can render a
// per-category label purely from `publications.categories.*` i18n keys, never a
// hardcoded category name.
export type PublicationCategory =
  | 'article'
  | 'pressRelease'
  | 'whitePaper'
  | 'report'
  | 'event'
  | 'consultation'
  | 'callForContribution';

export interface Publication {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly imageUrl: string;
  readonly publishedAt: string;
  readonly author: string;
  readonly category: PublicationCategory;
  readonly link: string;
  readonly readingTimeMinutes: number;
}

export function createPublication(fields: Publication): Publication {
  return Object.freeze({ ...fields });
}
