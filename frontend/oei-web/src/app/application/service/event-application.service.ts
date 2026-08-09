import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EVENT_PORT } from '../../domain/port/event/event.port';
import { Event } from '../../domain/model/event/event';

@Service()
export class EventApplicationService {
  private readonly port = inject(EVENT_PORT);

  listPublic(): Observable<Event[]> {
    return this.port.listPublic();
  }

  getBySlug(slug: string): Observable<Event | undefined> {
    return this.port.getBySlug(slug);
  }
}
