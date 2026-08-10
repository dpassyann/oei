import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
}
