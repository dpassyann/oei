import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CmsEventsModeration } from './cms-events-moderation';
import { EventModerationApplicationService } from '../../../../application/service/event-moderation-application.service';
import { createEventProposal } from '../../../../domain/model/event/event-proposal';
import { I18nService } from '../../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const PROPOSAL = createEventProposal({
  id: 'event-proposal-1',
  title: 'Un événement de test',
  description: 'Description',
  type: 'meetup',
  startAt: '2026-09-01T10:00:00.000Z',
  endAt: '2026-09-01T12:00:00.000Z',
  timezone: 'Europe/Paris',
  country: 'FR',
  authorId: 'member-1',
  status: 'MODERATOR_REVIEW',
  submittedAt: '2026-08-01T00:00:00.000Z',
});

describe('CmsEventsModeration', () => {
  function configure(
    overrides: {
      approve?: ReturnType<typeof vi.fn>;
      reject?: ReturnType<typeof vi.fn>;
      requestChanges?: ReturnType<typeof vi.fn>;
      pending?: ReturnType<typeof createEventProposal>[];
    } = {},
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: EventModerationApplicationService,
          useValue: {
            listPending: vi.fn().mockReturnValue(of(overrides.pending ?? [PROPOSAL])),
            approve: overrides.approve ?? vi.fn().mockReturnValue(of(undefined)),
            reject: overrides.reject ?? vi.fn().mockReturnValue(of(undefined)),
            requestChanges: overrides.requestChanges ?? vi.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    });
  }

  it('givenPendingProposals_whenRendered_thenListsThem', async () => {
    configure();
    const fixture = TestBed.createComponent(CmsEventsModeration);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Un événement de test');
  });

  it('givenPendingProposal_whenApproveClicked_thenDelegatesToServiceAndReloads', async () => {
    const approve = vi.fn().mockReturnValue(of(undefined));
    configure({ approve });
    const fixture = TestBed.createComponent(CmsEventsModeration);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.approve(PROPOSAL);

    expect(approve).toHaveBeenCalledWith('event-proposal-1');
  });

  it('givenPendingProposal_whenRejectConfirmed_thenDelegatesToServiceWithReason', async () => {
    const reject = vi.fn().mockReturnValue(of(undefined));
    configure({ reject });
    const fixture = TestBed.createComponent(CmsEventsModeration);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.startReject(PROPOSAL);
    fixture.componentInstance.onReasonChange('Hors sujet');
    fixture.componentInstance.confirmReject(PROPOSAL);

    expect(reject).toHaveBeenCalledWith('event-proposal-1', 'Hors sujet');
  });

  it('givenPendingProposal_whenRequestChangesConfirmedWithReason_thenDelegatesToService', async () => {
    const requestChanges = vi.fn().mockReturnValue(of(undefined));
    configure({ requestChanges });
    const fixture = TestBed.createComponent(CmsEventsModeration);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.startRequestChanges(PROPOSAL);
    fixture.componentInstance.onReasonChange('Merci de préciser le lieu');
    fixture.componentInstance.confirmRequestChanges(PROPOSAL);

    expect(requestChanges).toHaveBeenCalledWith('event-proposal-1', 'Merci de préciser le lieu');
  });

  it('givenNoPendingProposals_whenRendered_thenShowsEmptyState', async () => {
    configure({ pending: [] });
    const fixture = TestBed.createComponent(CmsEventsModeration);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('cms.eventsModeration.empty');
  });
});
