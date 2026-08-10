import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EventApplicationService } from '../../../../application/service/event-application.service';
import { EventRegistrationApplicationService } from '../../../../application/service/event-registration-application.service';
import { EventFeedApplicationService } from '../../../../application/service/event-feed-application.service';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { buildEventFeed, EventFeedItem } from '../../../../domain/model/event/event-feed-item';
import { I18nService } from '../../../i18n/i18n.service';

// Public `/events` — a single reverse-chronological feed (task doc "04-EVENTS-COMMUNITY-FEED.md",
// per the explicit design request: "ressembler à un fil d'actualité LinkedIn ou Facebook").
// Sorting/aggregation itself lives in the pure `buildEventFeed` (domain model) rather than here —
// this component only wires resources to it and handles the two feed-card interactions
// (participate toggle, comment composer).
@Component({
  selector: 'oei-events-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
})
export class EventsList {
  protected readonly i18n = inject(I18nService);
  protected readonly keycloakAuth = inject(KeycloakAuthService);
  private readonly eventService = inject(EventApplicationService);
  private readonly registrationService = inject(EventRegistrationApplicationService);
  private readonly feedService = inject(EventFeedApplicationService);

  protected readonly isConnected = computed(() => this.keycloakAuth.isAuthenticated());

  private readonly eventsResource = rxResource({ stream: () => this.eventService.listPublic() });
  protected readonly isLoading = computed(() => this.eventsResource.isLoading());

  private readonly registrationsResource = rxResource({
    params: () => (this.isConnected() ? (this.eventsResource.value() ?? []).map((event) => event.id) : undefined),
    stream: ({ params }) => this.registrationService.getMyRegistrationsFor(params!),
  });

  protected readonly feed = computed<readonly EventFeedItem[]>(() =>
    buildEventFeed(
      this.eventsResource.value() ?? [],
      this.registrationsResource.value() ?? {},
      (event) => this.feedService.isFeedOpen(event),
    ),
  );

  protected readonly pendingRegistrationEventIds = signal<ReadonlySet<string>>(new Set());
  protected readonly commentDraftByEventId = signal<Record<string, string>>({});
  protected readonly commentSubmittingEventId = signal<string | null>(null);
  protected readonly commentSubmittedEventIds = signal<ReadonlySet<string>>(new Set());

  protected speakerNames(item: EventFeedItem): string {
    return (item.event.speakers ?? []).map((speaker) => speaker.name).join(', ');
  }

  protected isRegistrationPending(eventId: string): boolean {
    return this.pendingRegistrationEventIds().has(eventId);
  }

  protected toggleParticipation(item: EventFeedItem): void {
    if (!this.isConnected() || this.isRegistrationPending(item.event.id)) {
      return;
    }
    const eventId = item.event.id;
    this.pendingRegistrationEventIds.update((current) => new Set(current).add(eventId));
    const onSettled = (): void => {
      this.pendingRegistrationEventIds.update((current) => {
        const next = new Set(current);
        next.delete(eventId);
        return next;
      });
    };
    const onSuccess = (): void => {
      onSettled();
      this.registrationsResource.reload();
    };
    if (item.isRegistered) {
      this.registrationService.unregister(eventId).subscribe({ next: onSuccess, error: onSettled });
    } else {
      this.registrationService.register(eventId).subscribe({ next: onSuccess, error: onSettled });
    }
  }

  protected commentDraftFor(eventId: string): string {
    return this.commentDraftByEventId()[eventId] ?? '';
  }

  protected setCommentDraft(eventId: string, text: string): void {
    this.commentDraftByEventId.update((current) => ({ ...current, [eventId]: text }));
  }

  protected canComment(item: EventFeedItem): boolean {
    return this.isConnected() && item.isRegistered && item.isFeedOpen;
  }

  // Posts to the event's own feed (see `EventFeedApplicationService.createPost`) — the domain
  // model has no separate "event-level comment" concept, so writing directly from this card
  // creates the first post of that event's thread, exactly like posting from `event-detail`
  // would. `commentSubmittedEventIds` only drives this card's own success message; the full
  // thread (and any replies to it) still lives on `/events/:slug`.
  protected submitComment(item: EventFeedItem): void {
    const eventId = item.event.id;
    const text = this.commentDraftFor(eventId).trim();
    if (!text || this.commentSubmittingEventId()) {
      return;
    }
    this.commentSubmittingEventId.set(eventId);
    this.feedService.createPost(eventId, { text }).subscribe({
      next: () => {
        this.commentSubmittingEventId.set(null);
        this.setCommentDraft(eventId, '');
        this.commentSubmittedEventIds.update((current) => new Set(current).add(eventId));
      },
      error: () => this.commentSubmittingEventId.set(null),
    });
  }

  protected hasSubmittedComment(eventId: string): boolean {
    return this.commentSubmittedEventIds().has(eventId);
  }
}
