import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionAuditLogApiAdapter } from './institution-audit-log-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_AUDIT_LOG } from './institution-demo-data';

describe('InstitutionAuditLogApiAdapter', () => {
  it('whenListAuditLog_thenCallsAuditLogEndpoint', async () => {
    TestBed.configureTestingModule({
      providers: [
        InstitutionAuditLogApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    const adapter = TestBed.inject(InstitutionAuditLogApiAdapter);
    const httpMock = TestBed.inject(HttpTestingController);
    const result = firstValueFrom(adapter.listAuditLog());
    httpMock.expectOne('/api/institution/v1/audit-log').flush(DEMO_AUDIT_LOG);
    await result;
    httpMock.verify();
  });
});
