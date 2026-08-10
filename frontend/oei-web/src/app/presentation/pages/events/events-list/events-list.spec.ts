import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EventsList } from './events-list';
import { EventApplicationService } from '../../../../application/service/event-application.service';
import { EventRegistrationApplicationService } from '../../../../application/service/event-registration-application.service';
import { EventFeedApplicationService } from '../../../../application/service/event-feed-application.service';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { createEvent } from '../../../../domain/model/event/event';
import { I18nService } from '../../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const UPCOMING_EVENT = createEvent({
  id: 'event-1',
  slug: 'event-1',
  title: 'Événement à venir',
  type: 'meetup',
  description: 'Description',
  location: { country: 'FR', city: 'Paris' },
  startAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  timezone: 'Europe/Paris',
  visibility: 'public',
  organizers: [],
  languages: ['fr'],
  status: 'REGISTRATION_OPEN',
});

const PAST_EVENT = createEvent({
  id: 'event-2',
  slug: 'event-2',
  title: 'Événement passé',
  type: 'colloque',
  description: 'Description',
  location: { country: 'FR', city: 'Lyon' },
  startAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  endAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  timezone: 'Europe/Paris',
  visibility: 'public',
  organizers: [],
  languages: ['fr'],
  status: 'ENDED',
  summary: 'Résumé de démonstration.',
});

function configure(options: { events?: unknown[]; connected?: boolean } = {}) {
  const events = options.events ?? [UPCOMING_EVENT, PAST_EVENT];
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      { provide: EventApplicationService, useValue: { listPublic: vi.fn().mockReturnValue(of(events)) } },
      { provide: KeycloakAuthService, useValue: { isAuthenticated: () => options.connected ?? false } },
      {
        provide: EventRegistrationApplicationService,
        useValue: {
          getMyRegistrationsFor: vi.fn().mockReturnValue(of({})),
          register: vi.fn().mockReturnValue(of(undefined)),
          unregister: vi.fn().mockReturnValue(of(undefined)),
        },
      },
      {
        provide: EventFeedApplicationService,
        useValue: {
          isFeedOpen: () => false,
          createPost: vi.fn(),
        },
      },
    ],
  });
}

describe('EventsList', () => {
  it('givenUpcomingAndPastEvents_whenRendered_thenShowsBothInASingleReverseChronologicalFeed', async () => {
    configure();
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const titles = Array.from(compiled.querySelectorAll('.oei-events-feed__title')).map((el) => el.textContent);
    // Reverse-chronological: the upcoming event's startAt is later than the past event's, so
    // it must render first.
    expect(titles).toEqual(['Événement à venir', 'Événement passé']);
    expect(compiled.textContent).toContain('Résumé de démonstration.');
  });

  it('givenNoEvents_whenRendered_thenShowsEmptyState', async () => {
    configure({ events: [] });
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('events.list.openEmpty');
  });

  it('givenVisitorNotConnected_whenRendered_thenShowsDisabledParticipatePill', async () => {
    configure({ connected: false });
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.oei-event-participate-pill--disabled').length).toBeGreaterThan(0);
  });

  it('givenConnectedAndNotRegistered_whenParticipateClicked_thenCallsRegisterAndReloadsRegistrations', async () => {
    const register = vi.fn().mockReturnValue(of(undefined));
    configure({ connected: true });
    TestBed.overrideProvider(EventRegistrationApplicationService, {
      useValue: { getMyRegistrationsFor: vi.fn().mockReturnValue(of({})), register, unregister: vi.fn() },
    });
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const pill = compiled.querySelector<HTMLButtonElement>('.oei-event-participate-pill:not([disabled])');
    pill?.click();

    expect(register).toHaveBeenCalledWith('event-1');
  });

  it('givenCommentFormSubmitted_whenFeedOpenAndRegistered_thenCreatesPostAndShowsSuccess', async () => {
    const createPost = vi.fn().mockReturnValue(of({ id: 'post-1' }));
    configure({ connected: true });
    TestBed.overrideProvider(EventRegistrationApplicationService, {
      useValue: {
        getMyRegistrationsFor: vi.fn().mockReturnValue(of({ 'event-1': true })),
        register: vi.fn(),
        unregister: vi.fn(),
      },
    });
    TestBed.overrideProvider(EventFeedApplicationService, {
      useValue: { isFeedOpen: () => true, createPost },
    });
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const input = compiled.querySelector<HTMLInputElement>('.oei-events-feed__comment-form .oei-input');
    input!.value = 'Un commentaire de test';
    input!.dispatchEvent(new Event('input'));
    compiled.querySelector('.oei-events-feed__comment-form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(createPost).toHaveBeenCalledWith('event-1', { text: 'Un commentaire de test' });
    expect(compiled.textContent).toContain('events.list.commentPosted');
  });
});
