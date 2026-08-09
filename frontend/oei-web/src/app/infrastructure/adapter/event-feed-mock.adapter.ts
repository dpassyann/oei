import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  EventCommentDraft,
  EventFeedPort,
  EventPostDraft,
} from '../../domain/port/event/event-feed.port';
import { createEventPost, EventPost } from '../../domain/model/event/event-post';
import { createEventComment, EventComment } from '../../domain/model/event/event-comment';

const DEMO_MEMBER_ID = 'demo-member-1';
const DEMO_MEMBER_NAME = 'Jane Dupont (Démonstration)';

// A couple of seed posts on the one event that is `LIVE`-shaped in demo data (`event-demo-2`,
// see `event-mock.adapter.ts`) so the feed page is never empty on first load. Simple in-memory
// arrays, same pattern as `ArticleModerationMockAdapter`'s `seedSubmissions` — no per-event
// namespacing beyond an `eventId` field, which is more than enough for this V1 mock.
function buildSeedPosts(): EventPost[] {
  return [
    createEventPost({
      id: 'event-post-demo-1',
      eventId: 'event-demo-2',
      authorId: 'member-demo-4',
      authorName: 'Karim Haddad (Démonstration)',
      text: '[Démonstration] Super introduction, merci pour les exemples concrets !',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      likesCount: 3,
      likedByMe: false,
    }),
  ];
}

function buildSeedComments(): EventComment[] {
  return [
    createEventComment({
      id: 'event-comment-demo-1',
      eventId: 'event-demo-2',
      postId: 'event-post-demo-1',
      authorId: 'member-demo-5',
      authorName: 'Léa Bernard (Démonstration)',
      text: "[Démonstration] Tout à fait d'accord, très clair.",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'VISIBLE',
    }),
  ];
}

let posts: EventPost[] = buildSeedPosts();
let comments: EventComment[] = buildSeedComments();
let postSequence = 0;
let commentSequence = 0;

/** Test-only reset hook, mirrors `resetArticleModerationFixtures()`. */
export function resetEventFeedFixtures(): void {
  posts = buildSeedPosts();
  comments = buildSeedComments();
  postSequence = 0;
  commentSequence = 0;
}

@Service()
export class EventFeedMockAdapter implements EventFeedPort {
  listPosts(eventId: string): Observable<EventPost[]> {
    return of(posts.filter((post) => post.eventId === eventId).slice().reverse());
  }

  createPost(eventId: string, draft: EventPostDraft): Observable<EventPost> {
    postSequence += 1;
    const post = createEventPost({
      id: `demo-event-post-${postSequence}`,
      eventId,
      authorId: DEMO_MEMBER_ID,
      authorName: DEMO_MEMBER_NAME,
      text: draft.text,
      photoUrl: draft.photoUrl,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedByMe: false,
    });
    posts.push(post);
    return of(post);
  }

  listComments(eventId: string, postId: string): Observable<EventComment[]> {
    return of(comments.filter((comment) => comment.eventId === eventId && comment.postId === postId));
  }

  addComment(eventId: string, draft: EventCommentDraft): Observable<EventComment> {
    const targetPost = posts.find((post) => post.id === draft.postId && post.eventId === eventId);
    if (!targetPost) {
      return throwError(() => new Error(`Event post "${draft.postId}" not found for event "${eventId}".`));
    }
    commentSequence += 1;
    const comment = createEventComment({
      id: `demo-event-comment-${commentSequence}`,
      eventId,
      postId: draft.postId,
      authorId: DEMO_MEMBER_ID,
      authorName: DEMO_MEMBER_NAME,
      text: draft.text,
      createdAt: new Date().toISOString(),
      status: 'VISIBLE',
    });
    comments.push(comment);
    return of(comment);
  }

  likePost(eventId: string, postId: string): Observable<EventPost> {
    const found = posts.find((post) => post.id === postId && post.eventId === eventId);
    if (!found) {
      return throwError(() => new Error(`Event post "${postId}" not found for event "${eventId}".`));
    }
    if (found.likedByMe) {
      // Idempotent: liking again is a no-op, per the spec ("Like simple, idempotent, un par membre").
      return of(found);
    }
    const liked = createEventPost({ ...found, likesCount: found.likesCount + 1, likedByMe: true });
    posts = posts.map((post) => (post.id === postId ? liked : post));
    return of(liked);
  }
}
