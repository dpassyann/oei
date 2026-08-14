import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionAuditLogPort } from '../../domain/port/institution/institution-audit-log.port';
import { InstitutionAuditLog } from '../../domain/model/institution/institution-audit-log';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionAuditLogApiAdapter implements InstitutionAuditLogPort {
  private readonly http = inject(HttpClient);

  listAuditLog(): Observable<InstitutionAuditLog[]> {
    return this.http.get<InstitutionAuditLog[]>(`${INSTITUTION_API_BASE}/audit-log`);
  }
}
