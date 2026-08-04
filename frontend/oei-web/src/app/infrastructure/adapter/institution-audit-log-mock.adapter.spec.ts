import { firstValueFrom } from 'rxjs';
import { InstitutionAuditLogMockAdapter } from './institution-audit-log-mock.adapter';

describe('InstitutionAuditLogMockAdapter', () => {
  it('whenListAuditLog_thenReturnsDemoAuditEntries', async () => {
    const adapter = new InstitutionAuditLogMockAdapter();
    const entries = await firstValueFrom(adapter.listAuditLog());
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.institutionId === 'inst-demo-institution')).toBe(true);
  });
});
