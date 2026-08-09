// A member comment on an event's feed post. Comments appear immediately then are
// post-moderated (per the spec) — `VISIBLE` is the default state on creation; `FLAGGED`/`HIDDEN`/
// `REMOVED` are moderator-driven transitions (see `EVENT_MODERATION_PORT.hideComment`).
export type EventCommentStatus = 'VISIBLE' | 'FLAGGED' | 'HIDDEN' | 'REMOVED';

export interface EventComment {
  readonly id: string;
  readonly eventId: string;
  readonly postId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly text: string;
  readonly createdAt: string;
  readonly status: EventCommentStatus;
}

export function createEventComment(fields: EventComment): EventComment {
  return Object.freeze({ ...fields });
}
