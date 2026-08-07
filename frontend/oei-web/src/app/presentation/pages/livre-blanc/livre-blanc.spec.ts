import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { LivreBlanc } from './livre-blanc';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';

const INTERFACE_STRINGS: Record<string, string> = {
  'livreBlancPage.title': 'Livre Blanc',
  'livreBlancPage.downloadPdf': 'Télécharger le PDF',
  'livreBlancPage.tableOfContents': 'Sommaire',
  'livreBlancPage.fallbackNotice':
    'Traduction non disponible pour le moment — version française affichée en attendant.',
  'livreBlancPage.loading': 'Chargement du document…',
  'livreBlancPage.notFound': 'Le Livre Blanc est introuvable pour le moment.',
  'livreBlancPage.backToHome': "Retour à l'accueil",
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
  '---',
  'title: "Livre Blanc"',
  '---',
  '',
  '# Livre Blanc',
  '',
  '## 1. Introduction',
  '',
  'Un paragraphe.',
  '',
  '## 2. Conclusion',
  '',
  'Un autre paragraphe.',
].join('\n');

describe('LivreBlanc', () => {
  it('givenDocumentLoads_whenCreated_thenRendersBodyAndTopLevelHeadingsInSideMenu', async () => {
    TestBed.configureTestingModule({
      imports: [LivreBlanc],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: {
            getMarkdownDocument: () =>
              of(
                createDocument({
                  slug: 'livre-blanc',
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
    const fixture = TestBed.createComponent(LivreBlanc);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // IDs starting with a digit ("1-introduction") are valid HTML but not a valid *unescaped*
    // CSS selector, hence the attribute-selector form rather than `h2#1-introduction`.
    expect(compiled.querySelector('h2[id="1-introduction"]')).toBeTruthy();
    expect(compiled.querySelector('h2[id="2-conclusion"]')).toBeTruthy();
    expect(compiled.textContent).toContain('Un paragraphe.');
    expect(compiled.querySelectorAll('.oei-floating-side-menu__link').length).toBe(2);
    expect(compiled.querySelector('.oei-fallback-banner')).toBeFalsy();
  });

  it('givenFallbackDocument_whenCreated_thenShowsFallbackBanner', async () => {
    TestBed.configureTestingModule({
      imports: [LivreBlanc],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: {
            getMarkdownDocument: () =>
              of(
                createDocument({
                  slug: 'livre-blanc',
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
    const fixture = TestBed.createComponent(LivreBlanc);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-fallback-banner')?.textContent).toContain('française');
  });

  it('givenDocumentFails_whenCreated_thenRendersNotFoundMessage', async () => {
    TestBed.configureTestingModule({
      imports: [LivreBlanc],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: { getMarkdownDocument: () => throwError(() => new Error('not found')) },
        },
      ],
    });
    const fixture = TestBed.createComponent(LivreBlanc);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
