import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EventsList } from './events-list';
import { EventApplicationService } from '../../../../application/service/event-application.service';
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

describe('EventsList', () => {
  function configure(events = [UPCOMING_EVENT, PAST_EVENT]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: EventApplicationService, useValue: { listPublic: vi.fn().mockReturnValue(of(events)) } },
      ],
    });
  }

  it('givenUpcomingEvent_whenRendered_thenShowsItAsFeatured', async () => {
    configure();
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Événement à venir');
  });

  it('givenPastEvent_whenRendered_thenShowsItInHistoryWithSummary', async () => {
    configure();
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Événement passé');
    expect(text).toContain('Résumé de démonstration.');
  });

  it('givenNoEvents_whenRendered_thenShowsEmptyStates', async () => {
    configure([]);
    const fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('events.list.openEmpty');
    expect(text).toContain('events.list.historyEmpty');
  });
});
