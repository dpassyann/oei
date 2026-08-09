import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../../model/event/event';

// `GET /api/public/v1/events` / `GET /api/public/v1/events/{slug}` — public, unauthenticated
// agenda reads. See `openapi/oei-api.yaml`'s `public-events` tag.
export interface EventPort {
  listPublic(): Observable<Event[]>;
  getBySlug(slug: string): Observable<Event | undefined>;
}

export const EVENT_PORT = new InjectionToken<EventPort>('EventPort');
