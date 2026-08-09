import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminAuditLogEntry } from '../../model/admin/admin-audit-log';

export interface AdminAuditLogCreation {
  readonly actorId: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly before?: Readonly<Record<string, unknown>> | null;
  readonly after?: Readonly<Record<string, unknown>> | null;
  readonly reason?: string | null;
  readonly correlationId: string;
}

/**
 * Matches `GET /api/admin/v1/audit-log` (`listAdminAuditLog`) in `openapi/oei-api.yaml`. There is
 * no dedicated "create audit entry" endpoint in the contract — real audit entries are written
 * server-side as a side effect of the corresponding admin action (e.g. `suspendInstitution`
 * itself journals the entry), not via a separate client call. `log()` exists on this port purely
 * so `AdminAuditService` has one place to call regardless of adapter; see each adapter's `log()`
 * doc comment for how mock vs. api honor that contract.
 */
export interface AdminAuditLogPort {
  list(): Observable<AdminAuditLogEntry[]>;
  log(entry: AdminAuditLogCreation): Observable<AdminAuditLogEntry>;
}

export const ADMIN_AUDIT_LOG_PORT = new InjectionToken<AdminAuditLogPort>('AdminAuditLogPort');
