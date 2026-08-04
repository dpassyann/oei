import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { StatsApiAdapter } from './stats-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('StatsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: StatsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        StatsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(StatsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsStats_whenGetHomeStats_thenMapsToDomainStats', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getHomeStats('fr'));
    const req = httpMock.expectOne('/api/v1/stats/fr');
    req.flush([{ label: 'Membres fondateurs', value: 0 }]);

    expect(await result).toEqual([{ label: 'Membres fondateurs', value: 0 }]);
    httpMock.verify();
  });

  it('givenNonDefaultApiBaseUrl_whenGetHomeStats_thenBuildsUrlFromRuntimeConfig', async () => {
    const { adapter, httpMock } = createAdapter('/custom-api');

    const result = firstValueFrom(adapter.getHomeStats('en'));
    const req = httpMock.expectOne('/custom-api/stats/en');
    req.flush([]);

    await result;
    httpMock.verify();
  });
});
