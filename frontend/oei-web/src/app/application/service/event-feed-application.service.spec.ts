import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EventFeedApplicationService } from './event-feed-application.service';
import { EventFeedPort, EVENT_FEED_PORT } from '../../domain/port/event/event-feed.port';
import { createEvent, Event } from '../../domain/model/event/event';

const BASE_EVENT: Event = createEvent({
  id: 'event-1',
  slug: 'event-1',
  title: 'Événement',
  type: 'meetup',
  description: 'Description',
  location: { country: 'FR' },
  startAt: '2026-08-10T10:00:00.000Z',
  endAt: '2026-08-10T18:00:00.000Z',
  timezone: 'Europe/Paris',
  visibility: 'public',
  organizers: [],
  languages: ['fr'],
  status: 'LIVE',
});

describe('EventFeedApplicationService', () => {
  function createService(port: Partial<EventFeedPort> = {}): EventFeedApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: EVENT_FEED_PORT, useValue: port }] });
    return TestBed.inject(EventFeedApplicationService);
  }

  it('whenListPosts_thenDelegatesToPort', async () => {
    const listPosts = vi.fn().mockReturnValue(of([]));
    const service = createService({ listPosts });

    await firstValueFrom(service.listPosts('event-1'));

    expect(listPosts).toHaveBeenCalledWith('event-1');
  });

  it('givenNowWithinEventWindow_whenIsFeedOpen_thenTrue', () => {
    const service = createService();
    const now = new Date('2026-08-10T12:00:00.000Z');

    expect(service.isFeedOpen(BASE_EVENT, now)).toBe(true);
  });

  it('givenNowAfterEventEnd_whenIsFeedOpen_thenFalse', () => {
    const service = createService();
    const now = new Date('2026-08-11T00:00:00.000Z');

    expect(service.isFeedOpen(BASE_EVENT, now)).toBe(false);
  });

  it('givenExplicitCommentsClosedAt_whenIsCommentsOpenAfterThatMoment_thenFalseEvenDuringEvent', () => {
    const service = createService();
    const eventWithEarlyClose = createEvent({ ...BASE_EVENT, commentsClosedAt: '2026-08-10T14:00:00.000Z' });
    const now = new Date('2026-08-10T15:00:00.000Z');

    expect(service.isCommentsOpen(eventWithEarlyClose, now)).toBe(false);
  });
});
