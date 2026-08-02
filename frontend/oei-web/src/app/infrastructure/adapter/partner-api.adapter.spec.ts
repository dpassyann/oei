import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PartnerApiAdapter } from './partner-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

const SAMPLE_PARTNER = {
  id: 'p1',
  name: 'Partenaire Un',
  logoUrl: '/logo.png',
  description: 'Desc',
  websiteUrl: 'https://partner.example',
  category: 'Institution',
};

describe('PartnerApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): PartnerApiAdapter {
    TestBed.configureTestingModule({
      providers: [PartnerApiAdapter, { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } }],
    });
    return TestBed.inject(PartnerApiAdapter);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('givenBackendReturnsPartners_whenGetPartners_thenMapsToDomainPartners', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([SAMPLE_PARTNER]) });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    const partners = await adapter.getPartners();

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/partners');
    expect(partners[0].id).toBe('p1');
  });

  it('givenNonDefaultApiBaseUrl_whenGetPartners_thenBuildsUrlFromRuntimeConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/custom-api');
    await adapter.getPartners();

    expect(fetchMock).toHaveBeenCalledWith('/custom-api/partners');
  });

  it('givenBackendReturnsPartner_whenGetPartner_thenBuildsUrlWithIdAndMapsResult', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(SAMPLE_PARTNER) });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    const partner = await adapter.getPartner('p1');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/partners/p1');
    expect(partner.name).toBe('Partenaire Un');
  });
});
