import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { AdminAuditLogCreation, AdminAuditLogPort } from '../../domain/port/admin/admin-audit-log.port';
import { AdminAuditLogEntry, createAdminAuditLogEntry } from '../../domain/model/admin/admin-audit-log';
import { RuntimeConfig } from '../config/runtime-config';

interface InstitutionAuditLogDto {
  readonly id: string;
  readonly actorId: string;
  readonly action: string;
  readonly targetType?: string;
  readonly targetId?: string;
  readonly occurredAt: string;
  readonly metadata?: {
    readonly before?: Record<string, unknown> | null;
    readonly after?: Record<string, unknown> | null;
    readonly reason?: string | null;
    readonly correlationId?: string;
  };
}

function fromDto(dto: InstitutionAuditLogDto): AdminAuditLogEntry {
  return createAdminAuditLogEntry({
    id: dto.id,
    actorId: dto.actorId,
    action: dto.action,
    targetType: dto.targetType ?? '',
    targetId: dto.targetId ?? '',
    occurredAt: dto.occurredAt,
    before: dto.metadata?.before ?? null,
    after: dto.metadata?.after ?? null,
    reason: dto.metadata?.reason ?? null,
    correlationId: dto.metadata?.correlationId ?? '',
  });
}

// Matches `GET /api/admin/v1/audit-log` (`listAdminAuditLog`), which returns `InstitutionAuditLog`
// items — `before`/`after`/`reason`/`correlationId` travel inside that schema's free-form
// `metadata` object (see `openapi/oei-api.yaml`'s additive extension of `InstitutionAuditLog`).
@Service()
export class AdminAuditLogApiAdapter implements AdminAuditLogPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  private get baseUrl(): string {
    return `${this.runtimeConfig.apiBaseUrl()}/admin/v1/audit-log`;
  }

  list(): Observable<AdminAuditLogEntry[]> {
    return this.http.get<InstitutionAuditLogDto[]>(this.baseUrl).pipe(map((items) => items.map(fromDto)));
  }

  // GAP: the OpenAPI contract has no "create audit entry" endpoint — real backends write audit
  // rows as a side effect of the admin action itself (e.g. the `suspend` endpoint journals its
  // own entry server-side). Calling `log()` against this adapter therefore only constructs the
  // entry client-side and returns it (matching what the server is expected to have already
  // persisted) rather than issuing a second, redundant write — swap for a real POST if/when the
  // contract ever adds one.
  log(entry: AdminAuditLogCreation): Observable<AdminAuditLogEntry> {
    return of(
      createAdminAuditLogEntry({
        id: `audit-${entry.correlationId}`,
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        occurredAt: new Date().toISOString(),
        before: entry.before ?? null,
        after: entry.after ?? null,
        reason: entry.reason ?? null,
        correlationId: entry.correlationId,
      }),
    );
  }
}
