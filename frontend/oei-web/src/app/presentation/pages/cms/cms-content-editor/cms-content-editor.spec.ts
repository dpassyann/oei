import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CmsContentEditor } from './cms-content-editor';
import { AdminContentApplicationService } from '../../../../application/service/admin-content-application.service';
import { createContent, createContentVersion } from '../../../../domain/model/cms/content.model';
import { I18nService } from '../../../i18n/i18n.service';

const INTERFACE_STRINGS: Record<string, string> = {
  'cms.editor.notFound': 'Contenu introuvable.',
  'cms.editor.actions.submit': 'Soumettre en revue',
  'cms.editor.body.markdown': 'Markdown',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithId(id: string) {
  return { paramMap: of(convertToParamMap({ id })) };
}

const DRAFT_CONTENT = createContent({
  id: 'content-1',
  type: 'ARTICLE',
  slug: 'article-1',
  sourceType: 'CMS',
  title: 'Article de test',
  tags: [],
  governance: { approvalRequired: false, decisionId: null },
  currentVersionId: 'version-1',
  status: 'DRAFT',
});

const DRAFT_VERSION = createContentVersion({
  id: 'version-1',
  contentId: 'content-1',
  version: '1.0-draft',
  language: 'fr',
  title: 'Article de test',
  body: 'Corps initial.',
  authorIds: ['admin-demo'],
  status: 'DRAFT',
  createdAt: '2026-01-01T00:00:00Z',
});

describe('CmsContentEditor', () => {
  function configure(routeId: string, overrides: Partial<Record<keyof AdminContentApplicationService, unknown>> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithId(routeId) },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: AdminContentApplicationService,
          useValue: {
            getById: vi.fn().mockReturnValue(of(DRAFT_CONTENT)),
            getVersions: vi.fn().mockReturnValue(of([DRAFT_VERSION])),
            availableActions: vi.fn().mockReturnValue(['submit']),
            ...overrides,
          },
        },
      ],
    });
  }

  it('givenNewRoute_whenRendered_thenShowsCreationForm', async () => {
    configure('new');
    const fixture = TestBed.createComponent(CmsContentEditor);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('givenExistingContentId_whenRendered_thenShowsContentTitleAndSubmitAction', async () => {
    configure('content-1');
    const fixture = TestBed.createComponent(CmsContentEditor);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Article de test');
    expect(text).toContain('Soumettre en revue');
  });

  it('givenUnknownContentId_whenGetByIdReturnsUndefined_thenShowsNotFoundMessage', async () => {
    configure('unknown', { getById: vi.fn().mockReturnValue(of(undefined)) });
    const fixture = TestBed.createComponent(CmsContentEditor);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Contenu introuvable.');
  });

  it('givenCreateDraft_whenCalled_thenDelegatesToServiceWithFormFields', () => {
    const create = vi.fn().mockReturnValue(of({ id: 'new-content' }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'cms/:id', component: CmsContentEditor }]),
        { provide: ActivatedRoute, useValue: activatedRouteWithId('new') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: AdminContentApplicationService,
          useValue: {
            getById: vi.fn().mockReturnValue(of(DRAFT_CONTENT)),
            getVersions: vi.fn().mockReturnValue(of([DRAFT_VERSION])),
            availableActions: vi.fn().mockReturnValue(['submit']),
            create,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(CmsContentEditor);
    fixture.detectChanges();

    fixture.componentInstance.onNewTypeChange('NEWS');
    fixture.componentInstance.onNewSlugChange('slug-1');
    fixture.componentInstance.onNewTitleChange('Titre 1');
    fixture.componentInstance.createDraft();

    expect(create).toHaveBeenCalledWith({ type: 'NEWS', slug: 'slug-1', sourceType: 'CMS', title: 'Titre 1' });
  });

  it('givenSubmitAction_whenCalled_thenDelegatesToServiceWithContentId', async () => {
    const submit = vi.fn().mockReturnValue(of(DRAFT_CONTENT));
    configure('content-1', { submit });
    const fixture = TestBed.createComponent(CmsContentEditor);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.submit();

    expect(submit).toHaveBeenCalledWith('content-1');
  });

  it('givenBodyDraftChanged_whenRendered_thenPreviewReflectsMarkdownRendering', async () => {
    configure('content-1');
    const fixture = TestBed.createComponent(CmsContentEditor);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.onBodyDraftChange('# Titre');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.oei-cms-editor__preview')?.innerHTML).toContain('<h1>Titre</h1>');
  });
});
