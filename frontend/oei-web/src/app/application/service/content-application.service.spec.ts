import { TestBed } from '@angular/core/testing';
import { ContentApplicationService } from './content-application.service';
import { CONTENT_REPOSITORY_PORT, ContentRepositoryPort } from '../../domain/port/content-repository.port';
import { createDocument } from '../../domain/model/document';

describe('ContentApplicationService', () => {
  it('givenPortReturnsDocument_whenGetHomeContent_thenMapsToDto', async () => {
    const fakePort: ContentRepositoryPort = {
      getHomeContent: (lang) =>
        Promise.resolve(createDocument({ slug: 'home', lang, title: 'Bienvenue', body: 'Contenu', isFallback: false })),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: CONTENT_REPOSITORY_PORT, useValue: fakePort }],
    });
    const service = TestBed.inject(ContentApplicationService);
    const dto = await service.getHomeContent('fr');
    expect(dto.title).toBe('Bienvenue');
    expect(dto.isFallback).toBe(false);
  });
});
