import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { PublicationsApplicationService } from './publications-application.service';
import { PUBLICATIONS_PORT, PublicationsPort } from '../../domain/port/publications.port';
import { createPublication } from '../../domain/model/publication';

describe('PublicationsApplicationService', () => {
  function setup(overrides?: PublicationsPort) {
    const fakePort: PublicationsPort = overrides ?? {
      getPublications: () =>
        of([
          createPublication({
            id: 'pub-1',
            slug: 'demo',
            title: 'Titre',
            excerpt: 'Extrait',
            imageUrl: 'img.png',
            publishedAt: '2026-01-01',
            author: 'OEI',
            category: 'report',
            link: '/publications/demo',
            readingTimeMinutes: 5,
          }),
        ]),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: PUBLICATIONS_PORT, useValue: fakePort }],
    });
    return TestBed.inject(PublicationsApplicationService);
  }

  it('givenPortReturnsPublications_whenGetPublications_thenForwardsLangAndReturnsThem', async () => {
    let receivedLang: string | undefined;
    const service = setup({
      getPublications: (lang) => {
        receivedLang = lang;
        return of([]);
      },
    });
    const publications = await firstValueFrom(service.getPublications('fr'));
    expect(receivedLang).toBe('fr');
    expect(publications).toEqual([]);
  });
});
