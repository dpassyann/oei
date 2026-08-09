import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EventCommentDraft,
  EVENT_FEED_PORT,
  EventPostDraft,
} from '../../domain/port/event/event-feed.port';
import { EventPost } from '../../domain/model/event/event-post';
import { EventComment } from '../../domain/model/event/event-comment';
import { Event } from '../../domain/model/event/event';

@Service()
export class EventFeedApplicationService {
  private readonly port = inject(EVENT_FEED_PORT);

  listPosts(eventId: string): Observable<EventPost[]> {
    return this.port.listPosts(eventId);
  }

  createPost(eventId: string, draft: EventPostDraft): Observable<EventPost> {
    return this.port.createPost(eventId, draft);
  }

  listComments(eventId: string, postId: string): Observable<EventComment[]> {
    return this.port.listComments(eventId, postId);
  }

  addComment(eventId: string, draft: EventCommentDraft): Observable<EventComment> {
    return this.port.addComment(eventId, draft);
  }

  likePost(eventId: string, postId: string): Observable<EventPost> {
    return this.port.likePost(eventId, postId);
  }

  // Live feed posting only ever happens within the event's own window (per the spec: "Pendant
  // la fenêtre autorisée" / "Après l'événement : feed en lecture seule"). No separate
  // "feed window" field exists on `Event` — the event's own `startAt`/`endAt` IS the window.
  isFeedOpen(event: Event, now: Date = new Date()): boolean {
    const start = new Date(event.startAt).getTime();
    const end = new Date(event.endAt).getTime();
    const nowMs = now.getTime();
    return nowMs >= start && nowMs <= end;
  }

  // Comments close automatically at `commentsClosedAt` when set, otherwise at the event's own
  // end — matching the spec's "Fermeture automatique à commentsClosedAt / fin événement". They
  // never open before `commentsOpenAt` (defaulting to the event's start) either.
  isCommentsOpen(event: Event, now: Date = new Date()): boolean {
    const nowMs = now.getTime();
    const opensAt = new Date(event.commentsOpenAt ?? event.startAt).getTime();
    const closesAt = new Date(event.commentsClosedAt ?? event.endAt).getTime();
    return nowMs >= opensAt && nowMs <= closesAt;
  }
}
