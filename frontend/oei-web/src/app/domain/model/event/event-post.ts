// A single entry in an event's live feed (short text + optional photo), posted by a member
// while the event's live window is open. Read-only once the event has ended (see
// `EventFeedApplicationService.isFeedOpen`) — posting a photo for the first time in an event
// requires prior photo-publication consent (see `event-photo-consent.ts`), which this model does
// not itself enforce (application-service concern).
export interface EventPost {
  readonly id: string;
  readonly eventId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly text: string;
  readonly photoUrl?: string;
  readonly createdAt: string;
  readonly likesCount: number;
  readonly likedByMe: boolean;
}

export function createEventPost(fields: EventPost): EventPost {
  return Object.freeze({ ...fields });
}
