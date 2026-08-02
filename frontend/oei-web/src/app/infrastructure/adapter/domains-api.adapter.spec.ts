import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DomainsApiAdapter } from './domains-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('DomainsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): DomainsApiAdapter {
    TestBed.configureTestingModule({
      providers: [DomainsApiAdapter, { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } }],
    });
    return TestBed.inject(DomainsApiAdapter);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('givenBackendReturnsDomains_whenGetDomainAreas_thenMapsToDomainDomainAreas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    const domains = await adapter.getDomainAreas();

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/domains');
    expect(domains).toEqual([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]);
  });

  it('givenNonDefaultApiBaseUrl_whenGetDomainAreas_thenBuildsUrlFromRuntimeConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ icon: 'shield-lock', title: 'Cybersécurité', description: 'Desc' }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/custom-api');
    await adapter.getDomainAreas();

    expect(fetchMock).toHaveBeenCalledWith('/custom-api/domains');
  });
});
