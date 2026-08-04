import { firstValueFrom } from 'rxjs';
import { InstitutionInvitationsMockAdapter } from './institution-invitations-mock.adapter';

describe('InstitutionInvitationsMockAdapter', () => {
  it('whenListInvitations_thenReturnsDemoInvitations', async () => {
    const adapter = new InstitutionInvitationsMockAdapter();
    const invitations = await firstValueFrom(adapter.listInvitations());
    expect(invitations.length).toBeGreaterThan(0);
  });

  it('whenCreateInvitation_thenAppearsInSubsequentList', async () => {
    const adapter = new InstitutionInvitationsMockAdapter();
    const created = await firstValueFrom(adapter.createInvitation({ email: 'nouveau@oei-demo-institution.org', role: 'READER' }));
    expect(created.status).toBe('PENDING');
    const invitations = await firstValueFrom(adapter.listInvitations());
    expect(invitations.some((invitation) => invitation.id === created.id)).toBe(true);
  });

  it('givenExistingInvitation_whenRevokeInvitation_thenStatusBecomesRevoked', async () => {
    const adapter = new InstitutionInvitationsMockAdapter();
    const revoked = await firstValueFrom(adapter.revokeInvitation('invitation-demo-1'));
    expect(revoked.status).toBe('REVOKED');
  });

  it('givenUnknownInvitation_whenRevokeInvitation_thenThrows', async () => {
    const adapter = new InstitutionInvitationsMockAdapter();
    await expect(firstValueFrom(adapter.revokeInvitation('unknown'))).rejects.toThrow();
  });
});
