import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminAuditLogCreation, AdminAuditLogPort } from '../../domain/port/admin/admin-audit-log.port';
import { AdminAuditLogEntry, createAdminAuditLogEntry } from '../../domain/model/admin/admin-audit-log';

function buildSeedEntries(): AdminAuditLogEntry[] {
  return [
    createAdminAuditLogEntry({
      id: 'audit-seed-1',
      actorId: 'admin-demo',
      action: 'INSTITUTION_APPROVE',
      targetType: 'Institution',
      targetId: 'inst-demo-institution',
      occurredAt: '2026-07-20T09:15:00Z',
      before: { status: 'DOCUMENTS_PENDING' },
      after: { status: 'APPROVED' },
      reason: null,
      correlationId: 'corr-audit-seed-1',
    }),
  ];
}

// In-memory "database" of audit entries (same convention as `admin-content-mock.adapter.ts`'s
// `seedContents`): every `AdminAuditService.log(...)` call from a mock-mode admin action appends
// here, so the `/admin/audit-log` viewer reflects real session activity, not just the seed row.
let entries: AdminAuditLogEntry[] = buildSeedEntries();

export function resetAdminAuditLogFixtures(): void {
  entries = buildSeedEntries();
}

@Service()
export class AdminAuditLogMockAdapter implements AdminAuditLogPort {
  list(): Observable<AdminAuditLogEntry[]> {
    return of([...entries].reverse());
  }

  log(entry: AdminAuditLogCreation): Observable<AdminAuditLogEntry> {
    const created = createAdminAuditLogEntry({
      id: `audit-${entries.length + 1}`,
      actorId: entry.actorId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      occurredAt: new Date().toISOString(),
      before: entry.before ?? null,
      after: entry.after ?? null,
      reason: entry.reason ?? null,
      correlationId: entry.correlationId,
    });
    entries = [...entries, created];
    return of(created);
  }
}
