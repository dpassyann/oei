import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EventPost } from '../../model/event/event-post';
import { EventComment } from '../../model/event/event-comment';

export interface EventPostDraft {
  readonly text: string;
  readonly photoUrl?: string;
}

export interface EventCommentDraft {
  readonly postId: string;
  readonly text: string;
}

// Event live feed — posts (short text + optional photo), comments and likes, all scoped to one
// event. No WebSocket/SSE per this task's constraints: presentation pages simply reload
// (`rxResource.reload()`) on a light interval or on user action; see `events/event-detail`.
//
// Route-wise this mirrors the task's literal contract (`POST /api/member/v1/events/{id}/comments`,
// `POST /api/member/v1/events/{id}/like`) plus the extra `posts`/`feed` endpoints needed to
// actually list/create feed entries (documented in `EventFeedApiAdapter`).
export interface EventFeedPort {
  listPosts(eventId: string): Observable<EventPost[]>;
  createPost(eventId: string, draft: EventPostDraft): Observable<EventPost>;
  listComments(eventId: string, postId: string): Observable<EventComment[]>;
  addComment(eventId: string, draft: EventCommentDraft): Observable<EventComment>;
  likePost(eventId: string, postId: string): Observable<EventPost>;
}

export const EVENT_FEED_PORT = new InjectionToken<EventFeedPort>('EventFeedPort');
