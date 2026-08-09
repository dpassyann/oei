import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminAuditLogPage } from './admin-audit-log';
import { AdminAuditService } from '../../../../application/service/admin-audit.service';
import { createAdminAuditLogEntry } from '../../../../domain/model/admin/admin-audit-log';

describe('AdminAuditLogPage', () => {
  it('givenEntries_whenCreated_thenRendersOneRowPerEntry', async () => {
    TestBed.configureTestingModule({
      imports: [AdminAuditLogPage],
      providers: [
        {
          provide: AdminAuditService,
          useValue: {
            list: () =>
              of([
                createAdminAuditLogEntry({
                  id: 'audit-1',
                  actorId: 'admin-demo',
                  action: 'INSTITUTION_SUSPEND',
                  targetType: 'Institution',
                  targetId: 'inst-1',
                  occurredAt: '2026-08-01T09:00:00Z',
                  before: { status: 'ACTIVE' },
                  after: { status: 'SUSPENDED' },
                  reason: 'Abus signalé (exemple).',
                  correlationId: 'corr-1',
                }),
              ]),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminAuditLogPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });
});
