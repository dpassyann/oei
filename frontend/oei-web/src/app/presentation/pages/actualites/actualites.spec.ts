import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Actualites } from './actualites';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { createNewsItem } from '../../../domain/model/news-item';
import { I18nService } from '../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'actualites.title': 'Actualités',
  'actualites.empty': "Aucune actualité n'a été publiée pour le moment. Revenez bientôt.",
  'actualites.readMore': 'Lire la suite',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('Actualites', () => {
  it('givenNoNews_whenRendered_thenShowsEmptyStateMessage', async () => {
    TestBed.configureTestingModule({
      imports: [Actualites],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: HomeSectionsApplicationService, useValue: { getLatestNews: vi.fn().mockReturnValue(of([])) } },
      ],
    });
    const fixture = TestBed.createComponent(Actualites);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Actualités');
    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucune actualité');
  });

  it('givenNewsFromService_whenRendered_thenListsThem', async () => {
    const item = createNewsItem({
      title: 'Article approuvé',
      excerpt: 'Extrait.',
      imageUrl: '/assets/news/appel-contribution.svg',
      path: '/actualites',
    });
    TestBed.configureTestingModule({
      imports: [Actualites],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: HomeSectionsApplicationService, useValue: { getLatestNews: vi.fn().mockReturnValue(of([item])) } },
      ],
    });
    const fixture = TestBed.createComponent(Actualites);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Article approuvé');
  });
});
