import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PublicationsApiAdapter } from './publications-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('PublicationsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: PublicationsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        PublicationsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(PublicationsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsPublications_whenGetPublications_thenBuildsUrlAndMapsResults', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getPublications('fr'));
    const req = httpMock.expectOne('/api/v1/publications/fr');
    req.flush([
      {
        id: 'pub-1',
        slug: 'demo',
        title: 'Titre',
        excerpt: 'Extrait',
        imageUrl: '/img.jpg',
        publishedAt: '2026-01-01',
        author: 'OEI',
        category: 'report',
        link: '/publications/demo',
        readingTimeMinutes: 5,
      },
    ]);

    expect((await result)[0].slug).toBe('demo');
    httpMock.verify();
  });
});
