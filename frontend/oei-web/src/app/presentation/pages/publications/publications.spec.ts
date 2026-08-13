import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Publications } from './publications';
import { PublicationsApplicationService } from '../../../application/service/publications-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createPublication, Publication } from '../../../domain/model/publication';

const INTERFACE_STRINGS: Record<string, string> = {
  'publications.title': 'Publications',
  'publications.intro': "Retrouvez ici les publications de l'Ordre International des Experts de l'Informatique.",
  'publications.empty': "Aucune publication n'a été mise en ligne pour le moment. Revenez bientôt.",
  'publications.readMore': 'Lire la suite',
  'publications.categories.article': 'Article',
  'publications.categories.pressRelease': 'Communiqué',
  'publications.categories.whitePaper': 'Livre blanc',
  'publications.categories.report': 'Rapport',
  'publications.categories.event': 'Événement',
  'publications.categories.consultation': 'Consultation',
  'publications.categories.callForContribution': 'Appel à contribution',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function fakePublicationsService(publications: Publication[]): Pick<PublicationsApplicationService, 'getPublications'> {
  return { getPublications: () => of(publications) };
}

describe('Publications', () => {
  function configure(publications: Publication[] = []) {
    TestBed.configureTestingModule({
      imports: [Publications],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: PublicationsApplicationService, useValue: fakePublicationsService(publications) },
      ],
    });
  }

  it('givenComponent_whenCreated_thenRendersHeadingAndSevenCategories', async () => {
    configure();
    const fixture = TestBed.createComponent(Publications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Publications');
    expect(compiled.querySelectorAll('.oei-publications__category').length).toBe(7);
  });

  it('givenNoPublications_whenCreated_thenRendersHonestEmptyState', async () => {
    configure([]);
    const fixture = TestBed.createComponent(Publications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucune publication');
    expect(compiled.querySelector('.oei-publications__list')).toBeNull();
  });

  it('givenPublications_whenCreated_thenRendersListInsteadOfEmptyState', async () => {
    const publications = [
      createPublication({
        id: 'pub-1',
        slug: 'demo-publication',
        title: 'Publication de démonstration',
        excerpt: 'Extrait',
        imageUrl: '/img.png',
        publishedAt: '2026-01-01',
        author: 'OEI',
        category: 'report',
        link: '/publications/demo-publication',
        readingTimeMinutes: 5,
      }),
    ];
    configure(publications);
    const fixture = TestBed.createComponent(Publications);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')).toBeNull();
    expect(compiled.querySelectorAll('.oei-publications__item').length).toBe(1);
    expect(compiled.textContent).toContain('Publication de démonstration');
  });
});
