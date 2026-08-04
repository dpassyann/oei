import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_AUDIT_LOG_PORT } from '../../domain/port/institution/institution-audit-log.port';
import { InstitutionAuditLog } from '../../domain/model/institution/institution-audit-log';

@Service()
export class InstitutionAuditLogApplicationService {
  private readonly port = inject(INSTITUTION_AUDIT_LOG_PORT);

  listAuditLog(): Observable<InstitutionAuditLog[]> {
    return this.port.listAuditLog();
  }
}
