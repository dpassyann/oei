import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { Deontologie } from './deontologie';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';

const INTERFACE_STRINGS: Record<string, string> = {
  'deontologie.title': 'Déontologie',
  'deontologie.loading': 'Chargement du contenu…',
  'deontologie.notFound': 'Le contenu de cette page est introuvable pour le moment.',
  'deontologie.fallbackNotice':
    'Traduction non disponible pour le moment — version française affichée en attendant.',
  'deontologie.tableOfContents': 'Sommaire',
};

function fakeI18nService() {
  return {
    currentLang: signal('fr'),
    setLang: () => Promise.resolve(),
    translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
    translateList: () => [],
  };
}

const CODE_MARKDOWN = [
  '# Code de déontologie',
  '',
  '## Préambule',
  '',
  'Un paragraphe de préambule.',
  '',
  '## Principe 1 — Protection du public',
  '',
  'Un paragraphe sur la protection du public.',
].join('\n');

function fakeMarkdownDocuments(options?: { isFallback?: boolean; fails?: boolean }) {
  return {
    getMarkdownDocument: () => {
      if (options?.fails) {
        return throwError(() => new Error('not found'));
      }
      return of(
        createDocument({
          slug: 'code-de-deontologie',
          lang: 'fr',
          title: '',
          body: CODE_MARKDOWN,
          isFallback: options?.isFallback ?? false,
        }),
      );
    },
  };
}

describe('Deontologie', () => {
  it('givenDocumentLoads_whenCreated_thenRendersBodyAndSideMenu', async () => {
    TestBed.configureTestingModule({
      imports: [Deontologie],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
      ],
    });
    const fixture = TestBed.createComponent(Deontologie);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Déontologie');
    expect(compiled.textContent).toContain('Un paragraphe de préambule.');
    expect(compiled.querySelector('h2[id="preambule"]')).toBeTruthy();
    expect(compiled.querySelectorAll('.oei-floating-side-menu__link').length).toBe(2);
    expect(compiled.querySelector('.oei-fallback-banner')).toBeFalsy();
  });

  it('givenFallbackDocument_whenCreated_thenShowsFallbackBanner', async () => {
    TestBed.configureTestingModule({
      imports: [Deontologie],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: fakeMarkdownDocuments({ isFallback: true }),
        },
      ],
    });
    const fixture = TestBed.createComponent(Deontologie);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-fallback-banner')?.textContent).toContain('française');
  });

  it('givenDocumentFails_whenCreated_thenRendersNotFoundMessage', async () => {
    TestBed.configureTestingModule({
      imports: [Deontologie],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: fakeMarkdownDocuments({ fails: true }),
        },
      ],
    });
    const fixture = TestBed.createComponent(Deontologie);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
