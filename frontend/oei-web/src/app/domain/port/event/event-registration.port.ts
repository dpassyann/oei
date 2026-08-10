import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EventRegistration } from '../../model/event/event-registration';

// `POST /api/member/v1/events/{id}/registrations` (+ a mock-friendly read to know whether the
// current member is already `GOING`, so the "Participer" CTA can render correctly without a
// dedicated `/registrations/me` endpoint in the V1 contract).
export interface EventRegistrationPort {
  register(eventId: string): Observable<EventRegistration>;
  unregister(eventId: string): Observable<void>;
  getMyRegistration(eventId: string): Observable<EventRegistration | undefined>;
}

export const EVENT_REGISTRATION_PORT = new InjectionToken<EventRegistrationPort>('EventRegistrationPort');
