import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StatsApiAdapter } from './stats-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('StatsApiAdapter', () => {
  let httpMock: HttpTestingController;

  function createAdapter(apiBaseUrl: string): StatsApiAdapter {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StatsApiAdapter,
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(StatsApiAdapter);
  }

  afterEach(() => httpMock.verify());

  it('givenBackendReturnsStats_whenGetHomeStats_thenMapsToDomainStats', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.getHomeStats();
    const req = httpMock.expectOne('/api/v1/stats');
    req.flush([{ label: 'Membres fondateurs', value: 0 }]);
    const stats = await promise;
    expect(stats).toEqual([{ label: 'Membres fondateurs', value: 0 }]);
  });

  it('givenNonDefaultApiBaseUrl_whenGetHomeStats_thenBuildsUrlFromRuntimeConfig', async () => {
    const adapter = createAdapter('/custom-api');
    const promise = adapter.getHomeStats();
    const req = httpMock.expectOne('/custom-api/stats');
    req.flush([{ label: 'Membres fondateurs', value: 0 }]);
    await promise;
  });
});
