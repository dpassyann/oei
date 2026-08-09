import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EVENT_PHOTO_CONSENT_PORT } from '../../domain/port/event/event-photo-consent.port';
import { EventPhotoConsent } from '../../domain/model/event/event-photo-consent';

@Service()
export class EventPhotoConsentApplicationService {
  private readonly port = inject(EVENT_PHOTO_CONSENT_PORT);

  hasConsented(eventId: string): Observable<boolean> {
    return this.port.hasConsented(eventId);
  }

  giveConsent(eventId: string): Observable<EventPhotoConsent> {
    return this.port.giveConsent(eventId);
  }
}
