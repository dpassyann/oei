// Global admin audit log entry — matches `InstitutionAuditLog` in `openapi/oei-api.yaml` (reused
// by `GET /api/admin/v1/audit-log`, see that operation's doc comment for why the same schema is
// shared), extended additively with `before`/`after`/`reason`/`correlationId` inside the schema's
// existing free-form `metadata` object rather than as new top-level fields, so the change stays
// backward-compatible with `InstitutionAuditLogPort`'s existing consumers. Task brief §Audit:
// "adminId, timestamp, IP, action, entité, before, after, reason, correlationId".
export interface AdminAuditLogEntry {
  readonly id: string;
  readonly actorId: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly occurredAt: string;
  readonly before: Readonly<Record<string, unknown>> | null;
  readonly after: Readonly<Record<string, unknown>> | null;
  readonly reason: string | null;
  readonly correlationId: string;
}

export function createAdminAuditLogEntry(fields: AdminAuditLogEntry): AdminAuditLogEntry {
  return Object.freeze({ ...fields });
}
