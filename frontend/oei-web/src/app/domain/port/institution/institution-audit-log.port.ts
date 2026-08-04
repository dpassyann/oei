import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionAuditLog } from '../../model/institution/institution-audit-log';

// `GET /api/institution/v1/audit-log`.
export interface InstitutionAuditLogPort {
  listAuditLog(): Observable<InstitutionAuditLog[]>;
}

export const INSTITUTION_AUDIT_LOG_PORT = new InjectionToken<InstitutionAuditLogPort>('InstitutionAuditLogPort');
