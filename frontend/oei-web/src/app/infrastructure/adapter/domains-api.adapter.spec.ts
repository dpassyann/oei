import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DomainsApiAdapter } from './domains-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('DomainsApiAdapter', () => {
  let httpMock: HttpTestingController;

  function createAdapter(apiBaseUrl: string): DomainsApiAdapter {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DomainsApiAdapter,
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(DomainsApiAdapter);
  }

  afterEach(() => httpMock.verify());

  it('givenBackendReturnsDomains_whenGetDomainAreas_thenMapsToDomainDomainAreas', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.getDomainAreas();
    const req = httpMock.expectOne('/api/v1/domains');
    req.flush([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);
    const domains = await promise;
    expect(domains).toEqual([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);
  });

  it('givenNonDefaultApiBaseUrl_whenGetDomainAreas_thenBuildsUrlFromRuntimeConfig', async () => {
    const adapter = createAdapter('/custom-api');
    const promise = adapter.getDomainAreas();
    const req = httpMock.expectOne('/custom-api/domains');
    req.flush([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);
    await promise;
  });
});
