import { Injectable } from '@angular/core';
import { PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner, Partner } from '../../domain/model/partner';

// Note: aucun partenariat réel n'est confirmé à ce jour. Ces entrées sont explicitement
// nommées "démonstration" pour ne pas laisser croire à un partenariat existant (contrairement
// aux logos IEEE/ACM/EPFL/UNESCO de la maquette, qui sont purement illustratifs).
const FIXTURES: Partner[] = [
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
];

@Injectable({ providedIn: 'root' })
export class PartnerMockAdapter implements PartnerRepositoryPort {
  async getPartners(): Promise<Partner[]> {
    return FIXTURES;
  }

  async getPartner(id: string): Promise<Partner> {
    const partner = FIXTURES.find((fixture) => fixture.id === id);
    if (!partner) {
      throw new Error(`Partner not found: ${id}`);
    }
    return partner;
  }
}
