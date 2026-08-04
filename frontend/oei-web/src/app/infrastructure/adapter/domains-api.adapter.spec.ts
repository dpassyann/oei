import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { DomainsApiAdapter } from './domains-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('DomainsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: DomainsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        DomainsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(DomainsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsDomains_whenGetDomainAreas_thenMapsToDomainDomainAreas', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getDomainAreas('fr'));
    const req = httpMock.expectOne('/api/v1/domains/fr');
    req.flush([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);

    expect(await result).toEqual([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);
    httpMock.verify();
  });

  it('givenNonDefaultApiBaseUrl_whenGetDomainAreas_thenBuildsUrlFromRuntimeConfig', async () => {
    const { adapter, httpMock } = createAdapter('/custom-api');

    const result = firstValueFrom(adapter.getDomainAreas('en'));
    const req = httpMock.expectOne('/custom-api/domains/en');
    req.flush([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);

    await result;
    httpMock.verify();
  });
});
