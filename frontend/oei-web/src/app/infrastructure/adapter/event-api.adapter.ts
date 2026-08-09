import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { EventPort } from '../../domain/port/event/event.port';
import { createEvent, Event } from '../../domain/model/event/event';

// Public, unauthenticated agenda reads — literal `/api/public/v1` prefix, same convention as
// `ArticleSubmissionApiAdapter`'s `/api/member/v1` (role-versioned per ADR 0002).
const EVENT_PUBLIC_API_BASE = '/api/public/v1';

@Service()
export class EventApiAdapter implements EventPort {
  private readonly http = inject(HttpClient);

  listPublic(): Observable<Event[]> {
    return this.http
      .get<Event[]>(`${EVENT_PUBLIC_API_BASE}/events`)
      .pipe(map((events) => events.map((event) => createEvent(event))));
  }

  getBySlug(slug: string): Observable<Event | undefined> {
    return this.http.get<Event>(`${EVENT_PUBLIC_API_BASE}/events/${slug}`).pipe(
      map((event) => createEvent(event)),
      catchError(() => of(undefined)),
    );
  }
}
