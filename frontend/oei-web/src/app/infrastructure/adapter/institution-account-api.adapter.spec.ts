import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionAccountApiAdapter } from './institution-account-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_INSTITUTION, DEMO_PARTNERSHIP } from './institution-demo-data';

describe('InstitutionAccountApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionAccountApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        InstitutionAccountApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    return { adapter: TestBed.inject(InstitutionAccountApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenGetMyInstitution_thenCallsAccountEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getMyInstitution());
    httpMock.expectOne('/api/institution/v1/account').flush(DEMO_INSTITUTION);
    expect((await result).publicSlug).toBe('demo-institution');
    httpMock.verify();
  });

  it('whenGetMyPartnership_thenCallsPartnershipEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getMyPartnership());
    httpMock.expectOne('/api/institution/v1/partnership').flush(DEMO_PARTNERSHIP);
    await result;
    httpMock.verify();
  });

  it('whenUpdateMyInstitution_thenCallsAccountEndpointWithPut', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.updateMyInstitution(DEMO_INSTITUTION));
    const req = httpMock.expectOne('/api/institution/v1/account');
    expect(req.request.method).toBe('PUT');
    req.flush(DEMO_INSTITUTION);
    await result;
    httpMock.verify();
  });
});
