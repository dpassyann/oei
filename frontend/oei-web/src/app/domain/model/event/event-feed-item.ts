import { Event } from './event';

// View-level aggregate consumed by `/events` (a LinkedIn/Facebook-style feed, not the old
// featured/open/history agenda sections): one entry per event, already carrying whatever the
// feed card needs to render its "like"-style participate pill and its comment composer, so the
// component itself only renders — it never re-derives registration/window state per event.
export interface EventFeedItem {
  readonly event: Event;
  readonly isRegistered: boolean;
  // Whether the event's own live window (see `EventFeedApplicationService.isFeedOpen`) is
  // currently open — the composer is always visible (spec: "les commentaires... sont déjà
  // disponibles à la saisie"), but only ever enabled while this is true.
  readonly isFeedOpen: boolean;
}

const CANCELLED_OR_DRAFT = new Set(['DRAFT', 'CANCELLED']);

// Pure, unit-testable: builds the feed in reverse-chronological order (most recent `startAt`
// first, matching "événements ordonnés par date décroissante") from the raw events list, the
// member's per-event registration map (see `EventRegistrationApplicationService.
// getMyRegistrationsFor`), and a `isFeedOpen` predicate (kept injectable so this stays a pure
// function with no service dependency of its own).
export function buildEventFeed(
  events: readonly Event[],
  registrations: Readonly<Record<string, boolean>>,
  isFeedOpen: (event: Event) => boolean,
): readonly EventFeedItem[] {
  return events
    .filter((event) => !CANCELLED_OR_DRAFT.has(event.status))
    .slice()
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .map((event) => ({
      event,
      isRegistered: registrations[event.id] ?? false,
      isFeedOpen: isFeedOpen(event),
    }));
}
