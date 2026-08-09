import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  EventCommentDraft,
  EventFeedPort,
  EventPostDraft,
} from '../../domain/port/event/event-feed.port';
import { createEventPost, EventPost } from '../../domain/model/event/event-post';
import { createEventComment, EventComment } from '../../domain/model/event/event-comment';

const EVENT_MEMBER_API_BASE = '/api/member/v1';

// Endpoints not in the task's literal 9-endpoint list (`feed`/`posts`/`comments` query by post)
// are a documented, minimal extension needed to actually list/create feed entries — see
// `EventFeedPort`'s own doc comment. `comments`/`like` keep the literal `events/{id}/...` shape
// from the contract, with the target post carried in the request body.
@Service()
export class EventFeedApiAdapter implements EventFeedPort {
  private readonly http = inject(HttpClient);

  listPosts(eventId: string): Observable<EventPost[]> {
    return this.http
      .get<EventPost[]>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/feed`)
      .pipe(map((items) => items.map((item) => createEventPost(item))));
  }

  createPost(eventId: string, draft: EventPostDraft): Observable<EventPost> {
    return this.http
      .post<EventPost>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/posts`, draft)
      .pipe(map((post) => createEventPost(post)));
  }

  listComments(eventId: string, postId: string): Observable<EventComment[]> {
    return this.http
      .get<EventComment[]>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/posts/${postId}/comments`)
      .pipe(map((items) => items.map((item) => createEventComment(item))));
  }

  addComment(eventId: string, draft: EventCommentDraft): Observable<EventComment> {
    return this.http
      .post<EventComment>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/comments`, draft)
      .pipe(map((comment) => createEventComment(comment)));
  }

  likePost(eventId: string, postId: string): Observable<EventPost> {
    return this.http
      .post<EventPost>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/like`, { postId })
      .pipe(map((post) => createEventPost(post)));
  }
}
