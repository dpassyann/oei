import { createInstitutionAuditLog } from './institution-audit-log';

describe('InstitutionAuditLog', () => {
  it('givenValidFields_whenCreateInstitutionAuditLog_thenReturnsFrozenValue', () => {
    const entry = createInstitutionAuditLog({
      id: 'audit-1',
      institutionId: 'inst-demo',
      actorId: 'member-admin',
      action: 'AFFILIATION_APPROVED',
      targetType: 'MemberInstitutionAffiliation',
      targetId: 'aff-1',
      occurredAt: '2026-01-01T00:00:00Z',
    });
    expect(entry.action).toBe('AFFILIATION_APPROVED');
    expect(Object.isFrozen(entry)).toBe(true);
  });
});
