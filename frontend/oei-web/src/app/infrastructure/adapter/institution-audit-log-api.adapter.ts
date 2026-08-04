import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionAuditLogPort } from '../../domain/port/institution/institution-audit-log.port';
import { InstitutionAuditLog } from '../../domain/model/institution/institution-audit-log';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionAuditLogApiAdapter implements InstitutionAuditLogPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listAuditLog(): Observable<InstitutionAuditLog[]> {
    return this.http.get<InstitutionAuditLog[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/audit-log`);
  }
}
