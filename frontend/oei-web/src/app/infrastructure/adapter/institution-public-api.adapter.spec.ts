import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionPublicApiAdapter } from './institution-public-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_INSTITUTION } from './institution-demo-data';

describe('InstitutionPublicApiAdapter', () => {
  it('whenGetPublicInstitution_thenCallsPublicInstitutionsEndpoint', async () => {
    TestBed.configureTestingModule({
      providers: [
        InstitutionPublicApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    const adapter = TestBed.inject(InstitutionPublicApiAdapter);
    const httpMock = TestBed.inject(HttpTestingController);
    const result = firstValueFrom(adapter.getPublicInstitution('demo-institution'));
    httpMock
      .expectOne('/api/public/v1/institutions/demo-institution')
      .flush({ institution: DEMO_INSTITUTION, partnership: null, publications: [], opportunities: [] });
    await result;
    httpMock.verify();
  });
});
