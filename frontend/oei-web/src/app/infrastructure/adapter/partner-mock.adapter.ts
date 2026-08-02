import { Service } from '@angular/core';
import { PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner, Partner } from '../../domain/model/partner';
import { SupportedLanguage } from '../../domain/model/document';

// Note: aucun partenariat réel n'est confirmé à ce jour. Ces entrées sont explicitement
// nommées "démonstration" pour ne pas laisser croire à un partenariat existant (contrairement
// aux logos IEEE/ACM/EPFL/UNESCO de la maquette, qui sont purement illustratifs).
//
// Localized per language (same pattern as `ContentMockAdapter`/`StatsMockAdapter`): each entry
// below is a full translation of the same three demo partners, not a French copy duplicated
// per key. `id`/`logoUrl`/`websiteUrl` are structural and stay identical across languages.
const FIXTURES: Record<SupportedLanguage, Partner[]> = {
  fr: [
    createPartner({
      id: 'demo-1',
      name: 'Partenaire de démonstration 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Exemple de fiche partenaire utilisé en attendant un partenariat réel confirmé.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Démonstration',
    }),
    createPartner({
      id: 'demo-2',
      name: 'Partenaire de démonstration 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Exemple de fiche partenaire utilisé en attendant un partenariat réel confirmé.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Démonstration',
    }),
    createPartner({
      id: 'demo-3',
      name: 'Partenaire de démonstration 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Exemple de fiche partenaire utilisé en attendant un partenariat réel confirmé.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Démonstration',
    }),
  ],
  en: [
    createPartner({
      id: 'demo-1',
      name: 'Demo partner 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Sample partner entry used until a real partnership is confirmed.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demo',
    }),
    createPartner({
      id: 'demo-2',
      name: 'Demo partner 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Sample partner entry used until a real partnership is confirmed.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demo',
    }),
    createPartner({
      id: 'demo-3',
      name: 'Demo partner 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Sample partner entry used until a real partnership is confirmed.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demo',
    }),
  ],
  de: [
    createPartner({
      id: 'demo-1',
      name: 'Demo-Partner 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Beispiel-Partnereintrag, verwendet bis eine echte Partnerschaft bestätigt ist.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demo',
    }),
    createPartner({
      id: 'demo-2',
      name: 'Demo-Partner 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Beispiel-Partnereintrag, verwendet bis eine echte Partnerschaft bestätigt ist.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demo',
    }),
    createPartner({
      id: 'demo-3',
      name: 'Demo-Partner 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Beispiel-Partnereintrag, verwendet bis eine echte Partnerschaft bestätigt ist.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demo',
    }),
  ],
  es: [
    createPartner({
      id: 'demo-1',
      name: 'Socio de demostración 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Ficha de socio de ejemplo utilizada hasta confirmar una asociación real.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demostración',
    }),
    createPartner({
      id: 'demo-2',
      name: 'Socio de demostración 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Ficha de socio de ejemplo utilizada hasta confirmar una asociación real.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demostración',
    }),
    createPartner({
      id: 'demo-3',
      name: 'Socio de demostración 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Ficha de socio de ejemplo utilizada hasta confirmar una asociación real.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demostración',
    }),
  ],
  it: [
    createPartner({
      id: 'demo-1',
      name: 'Partner dimostrativo 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Scheda partner di esempio usata in attesa di una partnership reale confermata.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Dimostrazione',
    }),
    createPartner({
      id: 'demo-2',
      name: 'Partner dimostrativo 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Scheda partner di esempio usata in attesa di una partnership reale confermata.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Dimostrazione',
    }),
    createPartner({
      id: 'demo-3',
      name: 'Partner dimostrativo 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Scheda partner di esempio usata in attesa di una partnership reale confermata.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Dimostrazione',
    }),
  ],
  pt: [
    createPartner({
      id: 'demo-1',
      name: 'Parceiro de demonstração 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Ficha de parceiro de exemplo usada até a confirmação de uma parceria real.',
      websiteUrl: 'https://example.org/partenaire-demo-1',
      category: 'Demonstração',
    }),
    createPartner({
      id: 'demo-2',
      name: 'Parceiro de demonstração 2',
      logoUrl: '/assets/partners/demo-2.svg',
      description: 'Ficha de parceiro de exemplo usada até a confirmação de uma parceria real.',
      websiteUrl: 'https://example.org/partenaire-demo-2',
      category: 'Demonstração',
    }),
    createPartner({
      id: 'demo-3',
      name: 'Parceiro de demonstração 3',
      logoUrl: '/assets/partners/demo-3.svg',
      description: 'Ficha de parceiro de exemplo usada até a confirmação de uma parceria real.',
      websiteUrl: 'https://example.org/partenaire-demo-3',
      category: 'Demonstração',
    }),
  ],
};

@Service()
export class PartnerMockAdapter implements PartnerRepositoryPort {
  async getPartners(lang: string): Promise<Partner[]> {
    return FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en'];
  }

  async getPartner(id: string, lang: string): Promise<Partner> {
    const partner = (FIXTURES[lang as SupportedLanguage] ?? FIXTURES['en']).find((fixture) => fixture.id === id);
    if (!partner) {
      throw new Error(`Partner not found: ${id}`);
    }
    return partner;
  }
}
