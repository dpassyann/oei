import { firstValueFrom } from 'rxjs';
import { PartnerMockAdapter } from './partner-mock.adapter';

describe('PartnerMockAdapter', () => {
  it('givenNoRealPartnershipYet_whenGetPartnersFr_thenReturnsClearlyLabelledDemoPartners', async () => {
    const adapter = new PartnerMockAdapter();
    const partners = await firstValueFrom(adapter.getPartners('fr'));
    expect(partners.length).toBeGreaterThanOrEqual(2);
    expect(partners.length).toBeLessThanOrEqual(3);
    expect(partners.every((partner) => partner.name.includes('démonstration'))).toBe(true);
  });

  it('givenEnglishLang_whenGetPartners_thenReturnsEnglishDemoLabels', async () => {
    const adapter = new PartnerMockAdapter();
    const partners = await firstValueFrom(adapter.getPartners('en'));
    expect(partners.every((partner) => partner.name.toLowerCase().includes('demo'))).toBe(true);
  });

  it('givenExistingId_whenGetPartnerFr_thenReturnsMatchingFrenchPartner', async () => {
    const adapter = new PartnerMockAdapter();
    const partner = await firstValueFrom(adapter.getPartner('demo-1', 'fr'));
    expect(partner.id).toBe('demo-1');
    expect(partner.name).toBe('Partenaire de démonstration 1');
  });

  it('givenUnknownId_whenGetPartner_thenThrows', async () => {
    const adapter = new PartnerMockAdapter();
    await expect(firstValueFrom(adapter.getPartner('unknown', 'fr'))).rejects.toThrow();
  });
});
