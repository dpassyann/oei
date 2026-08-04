import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CmsContributions } from './cms-contributions';
import { ContributionApplicationService } from '../../../../application/service/contribution-application.service';
import { AdminContentApplicationService } from '../../../../application/service/admin-content-application.service';
import { createContentContribution } from '../../../../domain/model/governance/content-contribution.model';
import { createContent, createContentVersion } from '../../../../domain/model/cms/content.model';
import { I18nService } from '../../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const CONTRIBUTION = createContentContribution({
  id: 'contribution-1',
  contentId: 'content-1',
  patch: 'a\nB',
  authorMemberId: 'member-demo',
  status: 'PROPOSED',
  createdAt: '2026-01-01T00:00:00Z',
});

const CONTENT = createContent({
  id: 'content-1',
  type: 'REGULATION',
  slug: 'r',
  sourceType: 'GIT',
  title: 'Règlement',
  tags: [],
  governance: { approvalRequired: true, decisionId: null },
  currentVersionId: 'version-1',
  status: 'IN_REVIEW',
});

const VERSION = createContentVersion({
  id: 'version-1',
  contentId: 'content-1',
  version: '1.0',
  language: 'fr',
  title: 'Règlement',
  body: 'a\nb',
  authorIds: ['admin-demo'],
  status: 'IN_REVIEW',
  createdAt: '2026-01-01T00:00:00Z',
});

describe('CmsContributions', () => {
  function configure(overrides: { addComment?: ReturnType<typeof vi.fn> } = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: ContributionApplicationService,
          useValue: {
            listMine: vi.fn().mockReturnValue(of([CONTRIBUTION])),
            listComments: vi.fn().mockReturnValue(of([])),
            addComment: overrides.addComment ?? vi.fn().mockReturnValue(of({ id: 'comment-1' })),
            diffAgainstCurrentBody: (contribution: typeof CONTRIBUTION, body: string) =>
              body === 'a\nb' ? [{ type: 'unchanged', text: 'a' }, { type: 'removed', text: 'b' }, { type: 'added', text: 'B' }] : [],
          },
        },
        {
          provide: AdminContentApplicationService,
          useValue: { getById: vi.fn().mockReturnValue(of(CONTENT)), getVersions: vi.fn().mockReturnValue(of([VERSION])) },
        },
      ],
    });
  }

  it('givenContributions_whenRendered_thenListsThem', async () => {
    configure();
    const fixture = TestBed.createComponent(CmsContributions);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('content-1');
  });

  it('givenContributionSelected_whenDiffComputed_thenShowsRemovedAndAddedLines', async () => {
    configure();
    const fixture = TestBed.createComponent(CmsContributions);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.select(CONTRIBUTION);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('- b');
    expect(text).toContain('+ B');
  });

  it('givenNewComment_whenSubmitted_thenDelegatesToServiceAndClearsField', async () => {
    const addComment = vi.fn().mockReturnValue(of({ id: 'comment-1' }));
    configure({ addComment });
    const fixture = TestBed.createComponent(CmsContributions);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.select(CONTRIBUTION);
    fixture.componentInstance.onNewCommentChange('Un commentaire.');
    fixture.componentInstance.submitComment();

    expect(addComment).toHaveBeenCalledWith('contribution-1', 'Un commentaire.');
  });
});
