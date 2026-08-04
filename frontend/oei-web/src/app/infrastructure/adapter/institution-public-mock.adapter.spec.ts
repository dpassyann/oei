import { firstValueFrom } from 'rxjs';
import { InstitutionPublicMockAdapter } from './institution-public-mock.adapter';

describe('InstitutionPublicMockAdapter', () => {
  it('givenDemoSlug_whenGetPublicInstitution_thenReturnsOnlyPublishedContent', async () => {
    const adapter = new InstitutionPublicMockAdapter();
    const page = await firstValueFrom(adapter.getPublicInstitution('demo-institution'));
    expect(page.institution.publicSlug).toBe('demo-institution');
    expect(page.publications.every((publication) => publication.status === 'PUBLISHED')).toBe(true);
    expect(page.opportunities.every((opportunity) => opportunity.status === 'PUBLISHED')).toBe(true);
  });

  it('givenUnknownSlug_whenGetPublicInstitution_thenThrows', async () => {
    const adapter = new InstitutionPublicMockAdapter();
    await expect(firstValueFrom(adapter.getPublicInstitution('unknown-institution'))).rejects.toThrow();
  });
});
