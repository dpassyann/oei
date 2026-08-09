import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ADMIN_AUDIT_LOG_PORT } from '../../domain/port/admin/admin-audit-log.port';
import { AdminAuditLogEntry } from '../../domain/model/admin/admin-audit-log';

const DEMO_ADMIN_ID = 'admin-demo';

function newCorrelationId(): string {
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Single call site every admin action should go through to journal itself (task brief §Audit:
 * "Chaque action sensible journalise : adminId, timestamp, IP, action, entité, before, after,
 * reason, correlationId"). `adminId`/`timestamp`/`correlationId` are filled in here so callers
 * only supply the business-meaningful fields; IP is intentionally not captured (a browser cannot
 * observe its own public IP — that belongs server-side, where the real audit write eventually
 * happens per `AdminAuditLogPort`'s doc comment).
 */
@Service()
export class AdminAuditService {
  private readonly port = inject(ADMIN_AUDIT_LOG_PORT);

  list(): Observable<AdminAuditLogEntry[]> {
    return this.port.list();
  }

  log(
    action: string,
    entity: { readonly type: string; readonly id: string },
    before: Readonly<Record<string, unknown>> | null,
    after: Readonly<Record<string, unknown>> | null,
    reason?: string | null,
    correlationId: string = newCorrelationId(),
  ): Observable<AdminAuditLogEntry> {
    return this.port.log({
      actorId: DEMO_ADMIN_ID,
      action,
      targetType: entity.type,
      targetId: entity.id,
      before,
      after,
      reason: reason ?? null,
      correlationId,
    });
  }
}
