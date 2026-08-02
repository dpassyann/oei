import { createPartner } from './partner';

describe('Partner', () => {
  it('givenValidFields_whenCreatePartner_thenReturnsFrozenPartner', () => {
    const partner = createPartner({
      id: 'p1',
      name: 'Partenaire Un',
      logoUrl: '/assets/partners/p1.png',
      description: 'Un partenaire clé',
      websiteUrl: 'https://partenaire-un.example',
      category: 'Institution',
    });
    expect(partner.id).toBe('p1');
    expect(partner.name).toBe('Partenaire Un');
    expect(partner.logoUrl).toBe('/assets/partners/p1.png');
    expect(partner.description).toBe('Un partenaire clé');
    expect(partner.websiteUrl).toBe('https://partenaire-un.example');
    expect(partner.category).toBe('Institution');
    expect(Object.isFrozen(partner)).toBe(true);
  });
});
