import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionAuditLogApplicationService } from './institution-audit-log-application.service';
import { INSTITUTION_AUDIT_LOG_PORT } from '../../domain/port/institution/institution-audit-log.port';
import { DEMO_AUDIT_LOG } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionAuditLogApplicationService', () => {
  it('whenListAuditLog_thenDelegatesToPort', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: INSTITUTION_AUDIT_LOG_PORT, useValue: { listAuditLog: () => of([...DEMO_AUDIT_LOG]) } }],
    });
    const service = TestBed.inject(InstitutionAuditLogApplicationService);
    const entries = await firstValueFrom(service.listAuditLog());
    expect(entries).toEqual(DEMO_AUDIT_LOG);
  });
});
