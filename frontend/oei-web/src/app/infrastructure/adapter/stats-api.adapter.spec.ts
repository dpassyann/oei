import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StatsApiAdapter } from './stats-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('StatsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): StatsApiAdapter {
    TestBed.configureTestingModule({
      providers: [StatsApiAdapter, { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } }],
    });
    return TestBed.inject(StatsApiAdapter);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('givenBackendReturnsStats_whenGetHomeStats_thenMapsToDomainStats', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ label: 'Membres fondateurs', value: 0 }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    const stats = await adapter.getHomeStats();

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/stats');
    expect(stats).toEqual([{ label: 'Membres fondateurs', value: 0 }]);
  });

  it('givenNonDefaultApiBaseUrl_whenGetHomeStats_thenBuildsUrlFromRuntimeConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/custom-api');
    await adapter.getHomeStats();

    expect(fetchMock).toHaveBeenCalledWith('/custom-api/stats');
  });
});
