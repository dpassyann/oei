import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NewsApiAdapter } from './news-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('NewsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): NewsApiAdapter {
    TestBed.configureTestingModule({
      providers: [NewsApiAdapter, { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } }],
    });
    return TestBed.inject(NewsApiAdapter);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('givenBackendReturnsNews_whenGetLatestNews_thenBuildsUrlWithLimitAndMapsResults', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ title: 'Titre', excerpt: 'Extrait', imageUrl: '/img.jpg', path: '/news/titre' }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/api/v1');
    const news = await adapter.getLatestNews(3);

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/news?limit=3');
    expect(news).toEqual([{ title: 'Titre', excerpt: 'Extrait', imageUrl: '/img.jpg', path: '/news/titre' }]);
  });

  it('givenNonDefaultApiBaseUrl_whenGetLatestNews_thenBuildsUrlFromRuntimeConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAdapter('/custom-api');
    await adapter.getLatestNews(5);

    expect(fetchMock).toHaveBeenCalledWith('/custom-api/news?limit=5');
  });
});
