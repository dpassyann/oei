import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { EventRegistrationPort } from '../../domain/port/event/event-registration.port';
import { createEventRegistration, EventRegistration } from '../../domain/model/event/event-registration';

const EVENT_MEMBER_API_BASE = '/api/member/v1';

@Service()
export class EventRegistrationApiAdapter implements EventRegistrationPort {
  private readonly http = inject(HttpClient);

  register(eventId: string): Observable<EventRegistration> {
    return this.http
      .post<EventRegistration>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/registrations`, {})
      .pipe(map((registration) => createEventRegistration(registration)));
  }

  getMyRegistration(eventId: string): Observable<EventRegistration | undefined> {
    return this.http.get<EventRegistration>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/registrations/me`).pipe(
      map((registration) => createEventRegistration(registration)),
      catchError(() => of(undefined)),
    );
  }
}
