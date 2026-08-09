import { firstValueFrom } from 'rxjs';
import { AdminInstitutionsMockAdapter, resetAdminInstitutionsFixtures } from './admin-institutions-mock.adapter';

describe('AdminInstitutionsMockAdapter', () => {
  beforeEach(() => resetAdminInstitutionsFixtures());

  it('whenList_thenReturnsSeedInstitutionsWithStatus', async () => {
    const adapter = new AdminInstitutionsMockAdapter();
    const institutions = await firstValueFrom(adapter.list());
    expect(institutions.length).toBeGreaterThanOrEqual(2);
    expect(institutions.every((institution) => !!institution.status)).toBe(true);
  });

  it('givenCreationInput_whenCreated_thenReturnsDraftInstitution', async () => {
    const adapter = new AdminInstitutionsMockAdapter();
    const created = await firstValueFrom(
      adapter.create({
        legalName: 'Nouvelle Institution SA (exemple)',
        publicName: 'Nouvelle Institution',
        type: 'consulting',
        country: 'CH',
        emailDomains: ['nouvelle-institution.example'],
        primaryContactName: 'Jane Doe',
        institutionAdminEmail: 'jane.doe@nouvelle-institution.example',
        partnershipLevel: 'PROSPECT',
      }),
    );

    expect(created.status).toBe('DRAFT');
    expect(created.publicSlug).toBe('nouvelle-institution');
  });

  it('givenDocumentsPendingInstitution_whenApprovedThenActivated_thenReachesActive', async () => {
    const adapter = new AdminInstitutionsMockAdapter();
    const approved = await firstValueFrom(adapter.approve('inst-onboarding-example'));
    expect(approved.status).toBe('APPROVED');

    const activated = await firstValueFrom(adapter.activate('inst-onboarding-example'));
    expect(activated.status).toBe('ACTIVE');
  });

  it('givenActiveInstitution_whenRevokedWithoutReason_thenThrows', async () => {
    const adapter = new AdminInstitutionsMockAdapter();
    await expect(firstValueFrom(adapter.revoke('inst-demo-institution', ''))).rejects.toThrow();
  });

  it('givenActiveInstitution_whenRevokedWithReason_thenMovesToRevoked', async () => {
    const adapter = new AdminInstitutionsMockAdapter();
    const revoked = await firstValueFrom(adapter.revoke('inst-demo-institution', 'Fraude avérée (exemple).'));
    expect(revoked.status).toBe('REVOKED');
  });
});
