import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { MentionsLegales } from './mentions-legales';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';

const INTERFACE_STRINGS: Record<string, string> = {
  'mentionsLegales.title': 'Mentions légales',
  'mentionsLegales.loading': 'Chargement du contenu…',
  'mentionsLegales.notFound': 'Le contenu de cette page est introuvable pour le moment.',
  'mentionsLegales.fallbackNotice':
    'Traduction non disponible pour le moment — version française affichée en attendant.',
  'mentionsLegales.tableOfContents': 'Sommaire',
};

function fakeI18nService() {
  return {
    currentLang: signal('fr'),
    setLang: () => Promise.resolve(),
    translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
    translateList: () => [],
  };
}

const SAMPLE_MARKDOWN = [
  '# Statut juridique réel de l\'OEI',
  '',
  '## Ce que l\'OEI est aujourd\'hui',
  '',
  'Un mouvement fondateur en cours de constitution.',
  '',
  '## Avertissement',
  '',
  "Ce texte n'est pas un avis juridique.",
].join('\n');

describe('MentionsLegales', () => {
  it('givenDocumentLoads_whenCreated_thenRendersBodyAndTopLevelHeadingsInSideMenu', async () => {
    TestBed.configureTestingModule({
      imports: [MentionsLegales],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: {
            getMarkdownDocument: () =>
              of(
                createDocument({
                  slug: 'statut-juridique',
                  lang: 'fr',
                  title: '',
                  body: SAMPLE_MARKDOWN,
                  isFallback: false,
                }),
              ),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(MentionsLegales);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Mentions légales');
    expect(compiled.textContent).toContain('Un mouvement fondateur en cours de constitution.');
    expect(
      compiled.querySelector('h2[id="ce-que-loei-est-aujourdhui"]'),
    ).toBeTruthy();
    expect(compiled.querySelectorAll('.oei-floating-side-menu__link').length).toBe(2);
    expect(compiled.querySelector('.oei-fallback-banner')).toBeFalsy();
  });

  it('givenFallbackDocument_whenCreated_thenShowsFallbackBanner', async () => {
    TestBed.configureTestingModule({
      imports: [MentionsLegales],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: {
            getMarkdownDocument: () =>
              of(
                createDocument({
                  slug: 'statut-juridique',
                  lang: 'fr',
                  title: '',
                  body: SAMPLE_MARKDOWN,
                  isFallback: true,
                }),
              ),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(MentionsLegales);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-fallback-banner')?.textContent).toContain('française');
  });

  it('givenDocumentFails_whenCreated_thenRendersNotFoundMessage', async () => {
    TestBed.configureTestingModule({
      imports: [MentionsLegales],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: { getMarkdownDocument: () => throwError(() => new Error('not found')) },
        },
      ],
    });
    const fixture = TestBed.createComponent(MentionsLegales);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
