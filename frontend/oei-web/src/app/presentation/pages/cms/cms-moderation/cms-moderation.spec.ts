import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CmsModeration } from './cms-moderation';
import { ArticleModerationApplicationService } from '../../../../application/service/article-moderation-application.service';
import { createArticleSubmission } from '../../../../domain/model/article/article-submission';
import { I18nService } from '../../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const SUBMISSION = createArticleSubmission({
  id: 'article-submission-1',
  title: 'Un article de test',
  body: 'Corps de l’article de test.',
  authorId: 'member-1',
  status: 'pending',
  submittedAt: '2026-08-01T00:00:00.000Z',
});

describe('CmsModeration', () => {
  function configure(overrides: { approve?: ReturnType<typeof vi.fn>; reject?: ReturnType<typeof vi.fn> } = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: ArticleModerationApplicationService,
          useValue: {
            listPending: vi.fn().mockReturnValue(of([SUBMISSION])),
            approve: overrides.approve ?? vi.fn().mockReturnValue(of(undefined)),
            reject: overrides.reject ?? vi.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    });
  }

  it('givenPendingSubmissions_whenRendered_thenListsThem', async () => {
    configure();
    const fixture = TestBed.createComponent(CmsModeration);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Un article de test');
  });

  it('givenPendingSubmission_whenApproveClicked_thenDelegatesToServiceAndReloads', async () => {
    const approve = vi.fn().mockReturnValue(of(undefined));
    configure({ approve });
    const fixture = TestBed.createComponent(CmsModeration);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.approve(SUBMISSION);

    expect(approve).toHaveBeenCalledWith('article-submission-1');
  });

  it('givenPendingSubmission_whenRejectConfirmed_thenDelegatesToServiceWithReason', async () => {
    const reject = vi.fn().mockReturnValue(of(undefined));
    configure({ reject });
    const fixture = TestBed.createComponent(CmsModeration);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.startReject(SUBMISSION);
    fixture.componentInstance.onRejectReasonChange('Hors sujet');
    fixture.componentInstance.reject(SUBMISSION);

    expect(reject).toHaveBeenCalledWith('article-submission-1', 'Hors sujet');
  });

  it('givenNoPendingSubmissions_whenRendered_thenShowsEmptyState', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: ArticleModerationApplicationService,
          useValue: {
            listPending: vi.fn().mockReturnValue(of([])),
            approve: vi.fn(),
            reject: vi.fn(),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(CmsModeration);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('cms.moderation.empty');
  });
});
