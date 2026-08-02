import { PartnerMockAdapter } from './partner-mock.adapter';

describe('PartnerMockAdapter', () => {
  it('givenNoRealPartnershipYet_whenGetPartners_thenReturnsClearlyLabelledDemoPartners', async () => {
    const adapter = new PartnerMockAdapter();
    const partners = await adapter.getPartners();
    expect(partners.length).toBeGreaterThanOrEqual(2);
    expect(partners.length).toBeLessThanOrEqual(3);
    expect(partners.every((partner) => partner.name.includes('démonstration'))).toBe(true);
  });

  it('givenExistingId_whenGetPartner_thenReturnsMatchingPartner', async () => {
    const adapter = new PartnerMockAdapter();
    const partner = await adapter.getPartner('demo-1');
    expect(partner.id).toBe('demo-1');
    expect(partner.name).toBe('Partenaire de démonstration 1');
  });

  it('givenUnknownId_whenGetPartner_thenThrows', async () => {
    const adapter = new PartnerMockAdapter();
    await expect(adapter.getPartner('unknown')).rejects.toThrow();
  });
});
