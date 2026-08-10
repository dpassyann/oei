import { Service, inject } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { EVENT_REGISTRATION_PORT } from '../../domain/port/event/event-registration.port';
import { EventRegistration } from '../../domain/model/event/event-registration';

@Service()
export class EventRegistrationApplicationService {
  private readonly port = inject(EVENT_REGISTRATION_PORT);

  register(eventId: string): Observable<EventRegistration> {
    return this.port.register(eventId);
  }

  unregister(eventId: string): Observable<void> {
    return this.port.unregister(eventId);
  }

  getMyRegistration(eventId: string): Observable<EventRegistration | undefined> {
    return this.port.getMyRegistration(eventId);
  }

  // Batch orchestration for feed-style pages (e.g. `/events`) that need the current member's
  // registration status for many events at once — kept here rather than in a component so a
  // "many individual lookups" concern lives in the application layer, not view logic.
  getMyRegistrationsFor(eventIds: readonly string[]): Observable<Readonly<Record<string, boolean>>> {
    if (eventIds.length === 0) {
      return of({});
    }
    return forkJoin(eventIds.map((eventId) => this.port.getMyRegistration(eventId))).pipe(
      map((registrations) =>
        Object.fromEntries(eventIds.map((eventId, index) => [eventId, !!registrations[index]])),
      ),
    );
  }
}
