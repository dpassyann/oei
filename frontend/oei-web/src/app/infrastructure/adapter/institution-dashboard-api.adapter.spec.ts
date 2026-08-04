import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionDashboardApiAdapter } from './institution-dashboard-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_DASHBOARD } from './institution-demo-data';

describe('InstitutionDashboardApiAdapter', () => {
  it('whenGetDashboard_thenCallsDashboardEndpoint', async () => {
    TestBed.configureTestingModule({
      providers: [
        InstitutionDashboardApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    const adapter = TestBed.inject(InstitutionDashboardApiAdapter);
    const httpMock = TestBed.inject(HttpTestingController);
    const result = firstValueFrom(adapter.getDashboard());
    httpMock.expectOne('/api/institution/v1/dashboard').flush(DEMO_DASHBOARD);
    await result;
    httpMock.verify();
  });
});
