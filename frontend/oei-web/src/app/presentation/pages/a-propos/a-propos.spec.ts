import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { APropos } from './a-propos';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';

const INTERFACE_STRINGS: Record<string, string> = {
  'aPropos.title': 'À propos',
  'aPropos.loading': 'Chargement du contenu…',
  'aPropos.notFound': 'Le contenu de cette page est introuvable pour le moment.',
  'aPropos.fallbackNotice':
    'Traduction non disponible pour le moment — version française affichée en attendant.',
  'aPropos.tableOfContents': 'Sommaire',
};

function fakeI18nService() {
  return {
    currentLang: signal('fr'),
    setLang: () => Promise.resolve(),
    translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
    translateList: () => [],
  };
}

const VISION_MISSION_MARKDOWN = [
  '# Vision et mission',
  '',
  '## Vision',
  '',
  'Un paragraphe de vision.',
  '',
  '## Mission',
  '',
  'Un paragraphe de mission.',
].join('\n');

const POURQUOI_UN_ORDRE_MARKDOWN = [
  '# Pourquoi un Ordre ?',
  '',
  "### Pourquoi le mot « Ordre » ?",
  '',
  'Une réponse.',
].join('\n');

function fakeMarkdownDocuments(options?: { isFallback?: boolean; fails?: boolean }) {
  return {
    getMarkdownDocument: (path: string) => {
      if (options?.fails) {
        return throwError(() => new Error('not found'));
      }
      const body = path.includes('vision-mission')
        ? VISION_MISSION_MARKDOWN
        : POURQUOI_UN_ORDRE_MARKDOWN;
      return of(
        createDocument({
          slug: path,
          lang: 'fr',
          title: '',
          body,
          isFallback: options?.isFallback ?? false,
        }),
      );
    },
  };
}

describe('APropos', () => {
  it('givenDocumentsLoad_whenCreated_thenRendersBothBodiesAndCombinedSideMenu', async () => {
    TestBed.configureTestingModule({
      imports: [APropos],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
      ],
    });
    const fixture = TestBed.createComponent(APropos);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('À propos');
    expect(compiled.textContent).toContain('Un paragraphe de vision.');
    expect(compiled.textContent).toContain('Une réponse.');
    expect(compiled.querySelector('h2[id="vision"]')).toBeTruthy();
    expect(compiled.querySelector('h2[id="mission"]')).toBeTruthy();
    // Side menu: 2 headings from vision-mission.md (## level) + 1 from pourquoi-un-ordre.md
    // (### level, since that document has no ## at all — see a-propos.ts's comment).
    expect(compiled.querySelectorAll('.oei-floating-side-menu__link').length).toBe(3);
    expect(compiled.querySelector('.oei-fallback-banner')).toBeFalsy();
  });

  it('givenFallbackDocument_whenCreated_thenShowsFallbackBanner', async () => {
    TestBed.configureTestingModule({
      imports: [APropos],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: fakeMarkdownDocuments({ isFallback: true }),
        },
      ],
    });
    const fixture = TestBed.createComponent(APropos);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-fallback-banner')?.textContent).toContain('française');
  });

  it('givenDocumentsFail_whenCreated_thenRendersNotFoundMessage', async () => {
    TestBed.configureTestingModule({
      imports: [APropos],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: fakeI18nService() },
        {
          provide: MarkdownDocumentApplicationService,
          useValue: fakeMarkdownDocuments({ fails: true }),
        },
      ],
    });
    const fixture = TestBed.createComponent(APropos);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
