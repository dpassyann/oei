import { firstValueFrom } from 'rxjs';
import { AdminAuditLogMockAdapter, resetAdminAuditLogFixtures } from './admin-audit-log-mock.adapter';

describe('AdminAuditLogMockAdapter', () => {
  beforeEach(() => resetAdminAuditLogFixtures());

  it('whenList_thenReturnsSeedEntryMostRecentFirst', async () => {
    const adapter = new AdminAuditLogMockAdapter();
    const entries = await firstValueFrom(adapter.list());
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].action).toBe('INSTITUTION_APPROVE');
  });

  it('givenLoggedEntry_whenListedAfter_thenAppearsFirst', async () => {
    const adapter = new AdminAuditLogMockAdapter();
    await firstValueFrom(
      adapter.log({
        actorId: 'admin-demo',
        action: 'INSTITUTION_SUSPEND',
        targetType: 'Institution',
        targetId: 'inst-demo-institution',
        before: { status: 'ACTIVE' },
        after: { status: 'SUSPENDED' },
        reason: 'Abus signalé (exemple).',
        correlationId: 'corr-test-1',
      }),
    );

    const entries = await firstValueFrom(adapter.list());

    expect(entries[0].action).toBe('INSTITUTION_SUSPEND');
    expect(entries[0].reason).toBe('Abus signalé (exemple).');
  });
});
