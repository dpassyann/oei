// Mirrors the OpenAPI `Event` schema (`/api/public/v1/events`, `/api/public/v1/events/{slug}`
// — see `openapi/oei-api.yaml`'s `public-events` tag). Represents a published, agenda-worthy
// OEI event (meetup, colloque, webinar...) — never a member's raw proposal, which is a
// separate, pre-publication model (`EventProposal`, see `event-proposal.ts`).
export type EventType =
  | 'meetup'
  | 'colloque'
  | 'conference'
  | 'webinar'
  | 'workshop'
  | 'assemblee'
  | 'ceremonie'
  | 'networking';

// Publication/lifecycle status of a published event, distinct from `EventProposalStatus`
// (the member-submission workflow that precedes publication). `REGISTRATION_OPEN`/
// `REGISTRATION_CLOSED` let the agenda distinguish "you can still sign up" from "published but
// registrations not open yet/no longer open" without a separate boolean flag.
export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'LIVE'
  | 'ENDED'
  | 'ARCHIVED'
  | 'CANCELLED';

export type EventVisibility = 'public' | 'members';

// A physical venue XOR an online link — never both required, matching the spec's "lieu
// physique OU onlineUrl". Both are optional fields on the same shape (rather than a discriminated
// union) to keep mock/API JSON payloads simple; presentation code decides which to render based
// on whichever is populated.
export interface EventLocation {
  readonly country: string;
  readonly city?: string;
  readonly venue?: string;
  readonly onlineUrl?: string;
}

export interface EventSpeaker {
  readonly name: string;
  readonly role?: string;
}

export interface Event {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly type: EventType;
  readonly description: string;
  readonly imageUrl?: string;
  readonly location: EventLocation;
  readonly startAt: string; // ISO 8601
  readonly endAt: string; // ISO 8601
  readonly timezone: string;
  readonly capacity?: number;
  readonly registrationsCount?: number;
  readonly visibility: EventVisibility;
  readonly organizers: readonly string[];
  readonly languages: readonly string[];
  readonly speakers?: readonly EventSpeaker[];
  readonly status: EventStatus;
  // Feed/comments window: when omitted, comments follow the event's own start/end window (see
  // `event.ts` consumers — `isCommentsOpen` helpers in the feed application service). Explicit
  // fields let moderation close comments earlier than the event's natural end.
  readonly commentsOpenAt?: string;
  readonly commentsClosedAt?: string;
  // Populated only once `status` is `ENDED`/`ARCHIVED` — the "résumé" shown in the `/events`
  // history section (pays/date/photos/résumé/speakers per the spec).
  readonly summary?: string;
  readonly galleryImageUrls?: readonly string[];
}

export function createEvent(fields: Event): Event {
  return Object.freeze({ ...fields, organizers: [...fields.organizers], languages: [...fields.languages] });
}
