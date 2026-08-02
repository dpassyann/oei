import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ContentApiAdapter } from './content-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('ContentApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): ContentApiAdapter {
    TestBed.configureTestingModule({
      providers: [ContentApiAdapter, { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } }],
    });
    return TestBed.inject(ContentApiAdapter);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('givenBackendReturnsDocument_whenGetHomeContent_thenMapsToDomainDocument', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slug: 'home', lang: 'fr', title: 'Titre API', body: 'Corps API', isFallback: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    const doc = await adapter.getHomeContent('fr');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/content/fr/home');
    expect(doc.title).toBe('Titre API');
  });

  it('givenNonDefaultApiBaseUrl_whenGetHomeContent_thenBuildsUrlFromRuntimeConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slug: 'home', lang: 'en', title: 'Custom Title', body: 'Custom Body', isFallback: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/custom-api');
    const doc = await adapter.getHomeContent('en');

    expect(fetchMock).toHaveBeenCalledWith('/custom-api/content/en/home');
    expect(doc.title).toBe('Custom Title');
  });

  it('givenNonOkResponse_whenGetHomeContent_thenThrows', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const adapter = createAdapter('/api/v1');
    await expect(adapter.getHomeContent('fr')).rejects.toThrow();
  });
});
