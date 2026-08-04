/**
 * Fixture data for the `/api/v1/stats/:lang` mock route.
 *
 * Kept in sync with `src/app/infrastructure/adapter/stats-mock.adapter.ts`. All values are `0`
 * on purpose — the association has no founding members, academic partners, involved countries
 * or certifications yet, and showing `0` respects the project's honesty rule rather than
 * inventing numbers.
 */
export interface StatFixture {
  readonly label: string;
  readonly value: number;
}

/** lang -> list of stats. */
export const STATS_FIXTURES: Record<string, StatFixture[]> = {
  fr: [
    { label: 'Membres fondateurs', value: 0 },
    { label: 'Partenaires académiques', value: 0 },
    { label: 'Pays concernés', value: 0 },
    { label: 'Certifications en développement', value: 0 },
  ],
  en: [
    { label: 'Founding members', value: 0 },
    { label: 'Academic partners', value: 0 },
    { label: 'Countries involved', value: 0 },
    { label: 'Certifications in development', value: 0 },
  ],
  de: [
    { label: 'Gründungsmitglieder', value: 0 },
    { label: 'Akademische Partner', value: 0 },
    { label: 'Beteiligte Länder', value: 0 },
    { label: 'Zertifizierungen in Entwicklung', value: 0 },
  ],
  es: [
    { label: 'Miembros fundadores', value: 0 },
    { label: 'Socios académicos', value: 0 },
    { label: 'Países implicados', value: 0 },
    { label: 'Certificaciones en desarrollo', value: 0 },
  ],
  it: [
    { label: 'Membri fondatori', value: 0 },
    { label: 'Partner accademici', value: 0 },
    { label: 'Paesi coinvolti', value: 0 },
    { label: 'Certificazioni in sviluppo', value: 0 },
  ],
  pt: [
    { label: 'Membros fundadores', value: 0 },
    { label: 'Parceiros académicos', value: 0 },
    { label: 'Países envolvidos', value: 0 },
    { label: 'Certificações em desenvolvimento', value: 0 },
  ],
};
