import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EventApplicationService } from '../../../../application/service/event-application.service';
import { Event } from '../../../../domain/model/event/event';
import { I18nService } from '../../../i18n/i18n.service';

const OPEN_STATUSES = new Set(['PUBLISHED', 'REGISTRATION_OPEN', 'LIVE']);
const HISTORY_STATUSES = new Set(['ENDED', 'ARCHIVED']);

// Public `/events` agenda (task doc "04-EVENTS-COMMUNITY-FEED.md" §"Page /events"): the next
// upcoming event first, then every other open event, then the history — sorted so the section
// order reads chronologically without a dedicated backend endpoint per section.
@Component({
  selector: 'oei-events-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
})
export class EventsList {
  protected readonly i18n = inject(I18nService);
  private readonly eventService = inject(EventApplicationService);

  private readonly eventsResource = rxResource({ stream: () => this.eventService.listPublic() });
  private readonly events = computed<Event[]>(() => this.eventsResource.value() ?? []);

  private readonly upcomingSortedByDate = computed(() =>
    this.events()
      .filter((event) => OPEN_STATUSES.has(event.status))
      .slice()
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  );

  protected readonly featuredEvent = computed<Event | undefined>(() => this.upcomingSortedByDate()[0]);

  protected readonly openEvents = computed<Event[]>(() => this.upcomingSortedByDate().slice(1));

  protected readonly historyEvents = computed<Event[]>(() =>
    this.events()
      .filter((event) => HISTORY_STATUSES.has(event.status))
      .slice()
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
  );

  protected readonly isLoading = computed(() => this.eventsResource.isLoading());

  protected speakerNames(event: Event): string {
    return (event.speakers ?? []).map((speaker) => speaker.name).join(', ');
  }
}
