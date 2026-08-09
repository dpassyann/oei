import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ProposerEvenement } from './proposer-evenement';
import { EventProposalApplicationService } from '../../../../application/service/event-proposal-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { EventProposal } from '../../../../domain/model/event/event-proposal';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

function buildProposal(overrides: Partial<EventProposal> = {}): EventProposal {
  return {
    id: 'proposal-1',
    title: 'Mon événement',
    description: 'Description',
    type: 'meetup',
    startAt: '2026-09-01T10:00:00.000Z',
    endAt: '2026-09-01T12:00:00.000Z',
    timezone: 'Europe/Paris',
    country: 'FR',
    authorId: 'demo-member-1',
    status: 'MODERATOR_REVIEW',
    submittedAt: '2026-08-01T09:00:00Z',
    ...overrides,
  };
}

const VALID_DRAFT = {
  title: 'Titre test',
  description: 'Description test',
  type: 'meetup' as const,
  startAt: '2026-09-01T10:00',
  endAt: '2026-09-01T12:00',
  timezone: 'Europe/Paris',
  country: 'FR',
  city: '',
  venue: 'Salle test',
  onlineUrl: '',
  imageUrl: '',
};

describe('ProposerEvenement', () => {
  let submitSpy: ReturnType<typeof vi.fn>;
  let listMineSpy: ReturnType<typeof vi.fn>;

  function configure(mine: EventProposal[] = []) {
    submitSpy = vi.fn((draft) => of(buildProposal(draft)));
    listMineSpy = vi.fn(() => of(mine));

    TestBed.configureTestingModule({
      imports: [ProposerEvenement],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: EventProposalApplicationService, useValue: { submit: submitSpy, listMine: listMineSpy } },
      ],
    });
  }

  it('givenNoPriorProposals_whenRendered_thenShowsEmptyHistory', async () => {
    configure([]);
    const fixture = TestBed.createComponent(ProposerEvenement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('espaceMembre.proposerEvenement.mine.empty');
  });

  it('givenValidDraftWithVenue_whenSubmitted_thenDelegatesToServiceAndShowsPendingBanner', async () => {
    configure([]);
    const fixture = TestBed.createComponent(ProposerEvenement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ ...VALID_DRAFT });
    component['submit']();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Titre test', venue: 'Salle test', onlineUrl: undefined }),
    );
    expect(component['submitted']()).toBe(true);
  });

  it('givenNeitherVenueNorOnlineUrl_whenSubmitCalled_thenShowsErrorAndDoesNotCallService', () => {
    configure([]);
    const fixture = TestBed.createComponent(ProposerEvenement);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ ...VALID_DRAFT, venue: '', onlineUrl: '' });
    component['submit']();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(component['submitError']()).toBe(true);
  });

  it('givenServiceFails_whenSubmitted_thenShowsErrorAndStaysInFormMode', async () => {
    submitSpy = vi.fn(() => throwError(() => new Error('boom')));
    listMineSpy = vi.fn(() => of([]));
    TestBed.configureTestingModule({
      imports: [ProposerEvenement],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: EventProposalApplicationService, useValue: { submit: submitSpy, listMine: listMineSpy } },
      ],
    });
    const fixture = TestBed.createComponent(ProposerEvenement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ ...VALID_DRAFT });
    component['submit']();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['submitted']()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('.oei-proposer-evenement__error')).toBeTruthy();
  });

  it('givenPriorProposals_whenRendered_thenListsThemWithStatusAndAiPrecheck', async () => {
    configure([
      buildProposal({
        title: 'Colloque test',
        aiPrecheck: { passed: true, summary: 'Résumé du précheck IA', checkedAt: '2026-08-01T09:00:00Z' },
      }),
    ]);
    const fixture = TestBed.createComponent(ProposerEvenement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Colloque test');
    expect(text).toContain('Résumé du précheck IA');
  });
});
