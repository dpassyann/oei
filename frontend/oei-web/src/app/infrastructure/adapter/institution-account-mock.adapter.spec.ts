import { firstValueFrom } from 'rxjs';
import { InstitutionAccountMockAdapter } from './institution-account-mock.adapter';

describe('InstitutionAccountMockAdapter', () => {
  it('givenNoOverride_whenGetMyInstitution_thenReturnsDemoInstitutionLabelledAsDemo', async () => {
    const adapter = new InstitutionAccountMockAdapter();
    const institution = await firstValueFrom(adapter.getMyInstitution());
    expect(institution.publicSlug).toBe('demo-institution');
    expect(institution.isDemoData).toBe(true);
  });

  it('givenUpdatedInstitution_whenGetMyInstitutionAgain_thenReturnsUpdatedValue', async () => {
    const adapter = new InstitutionAccountMockAdapter();
    const current = await firstValueFrom(adapter.getMyInstitution());
    const updated = { ...current, description: 'Nouvelle description' };
    await firstValueFrom(adapter.updateMyInstitution(updated));
    const reloaded = await firstValueFrom(adapter.getMyInstitution());
    expect(reloaded.description).toBe('Nouvelle description');
  });

  it('whenGetMyPartnership_thenReturnsDemoPartnership', async () => {
    const adapter = new InstitutionAccountMockAdapter();
    const partnership = await firstValueFrom(adapter.getMyPartnership());
    expect(partnership.institutionId).toBe('inst-demo-institution');
  });
});
