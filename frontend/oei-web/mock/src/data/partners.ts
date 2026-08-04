/**
 * Fixture data for the `/api/v1/partners/:lang` and `/api/v1/partners/:lang/:id` mock routes.
 *
 * Kept in sync with `src/app/infrastructure/adapter/partner-mock.adapter.ts`. Every entry is
 * explicitly named "démonstration"/"demo" so nobody mistakes these for a confirmed real
 * partnership.
 */
export interface PartnerFixture {
  readonly id: string;
  readonly name: string;
  readonly logoUrl: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly category: string;
}

/** lang -> list of partners. `id`/`logoUrl`/`websiteUrl` stay identical across languages. */
export const PARTNERS_FIXTURES: Record<string, PartnerFixture[]> = {
  fr: [
    {
      id: 'demo-1',
      name: 'Partenaire de démonstration 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Exemple de fiche partenaire utilisé en attendant un partenariat réel confirmé.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Démonstration',
    },
    {
      id: 'demo-2',
      name: 'Partenaire de démonstration 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Exemple de fiche partenaire utilisé en attendant un partenariat réel confirmé.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Démonstration',
    },
    {
      id: 'demo-3',
      name: 'Partenaire de démonstration 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Exemple de fiche partenaire utilisé en attendant un partenariat réel confirmé.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Démonstration',
    },
  ],
  en: [
    {
      id: 'demo-1',
      name: 'Demo partner 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Sample partner entry used until a real partnership is confirmed.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demo',
    },
    {
      id: 'demo-2',
      name: 'Demo partner 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Sample partner entry used until a real partnership is confirmed.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demo',
    },
    {
      id: 'demo-3',
      name: 'Demo partner 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Sample partner entry used until a real partnership is confirmed.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demo',
    },
  ],
  de: [
    {
      id: 'demo-1',
      name: 'Demo-Partner 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Beispiel-Partnereintrag, verwendet bis eine echte Partnerschaft bestätigt ist.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demo',
    },
    {
      id: 'demo-2',
      name: 'Demo-Partner 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Beispiel-Partnereintrag, verwendet bis eine echte Partnerschaft bestätigt ist.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demo',
    },
    {
      id: 'demo-3',
      name: 'Demo-Partner 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Beispiel-Partnereintrag, verwendet bis eine echte Partnerschaft bestätigt ist.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demo',
    },
  ],
  es: [
    {
      id: 'demo-1',
      name: 'Socio de demostración 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Ficha de socio de ejemplo utilizada hasta confirmar una asociación real.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demostración',
    },
    {
      id: 'demo-2',
      name: 'Socio de demostración 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Ficha de socio de ejemplo utilizada hasta confirmar una asociación real.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demostración',
    },
    {
      id: 'demo-3',
      name: 'Socio de demostración 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Ficha de socio de ejemplo utilizada hasta confirmar una asociación real.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demostración',
    },
  ],
  it: [
    {
      id: 'demo-1',
      name: 'Partner dimostrativo 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Scheda partner di esempio usata in attesa di una partnership reale confermata.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Dimostrazione',
    },
    {
      id: 'demo-2',
      name: 'Partner dimostrativo 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Scheda partner di esempio usata in attesa di una partnership reale confermata.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Dimostrazione',
    },
    {
      id: 'demo-3',
      name: 'Partner dimostrativo 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Scheda partner di esempio usata in attesa di una partnership reale confermata.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Dimostrazione',
    },
  ],
  pt: [
    {
      id: 'demo-1',
      name: 'Parceiro de demonstração 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Ficha de parceiro de exemplo usada até a confirmação de uma parceria real.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demonstração',
    },
    {
      id: 'demo-2',
      name: 'Parceiro de demonstração 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Ficha de parceiro de exemplo usada até a confirmação de uma parceria real.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demonstração',
    },
    {
      id: 'demo-3',
      name: 'Parceiro de demonstração 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Ficha de parceiro de exemplo usada até a confirmação de uma parceria real.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demonstração',
    },
  ],
};
