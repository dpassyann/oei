import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InstitutionAuditLogPort } from '../../domain/port/institution/institution-audit-log.port';
import { InstitutionAuditLog } from '../../domain/model/institution/institution-audit-log';
import { DEMO_AUDIT_LOG } from './institution-demo-data';

@Service()
export class InstitutionAuditLogMockAdapter implements InstitutionAuditLogPort {
  listAuditLog(): Observable<InstitutionAuditLog[]> {
    return of([...DEMO_AUDIT_LOG]);
  }
}
