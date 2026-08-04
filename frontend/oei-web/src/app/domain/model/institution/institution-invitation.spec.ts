import { createInstitutionInvitation } from './institution-invitation';

describe('InstitutionInvitation', () => {
  it('givenValidFields_whenCreateInstitutionInvitation_thenReturnsFrozenValue', () => {
    const invitation = createInstitutionInvitation({
      id: 'inv-1',
      institutionId: 'inst-demo',
      email: 'nouvelle.recrue@oei-demo.org',
      role: 'CONTRIBUTOR',
      status: 'PENDING',
      invitedBy: 'member-admin',
      invitedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-01-15T00:00:00Z',
    });
    expect(invitation.status).toBe('PENDING');
    expect(Object.isFrozen(invitation)).toBe(true);
  });
});
