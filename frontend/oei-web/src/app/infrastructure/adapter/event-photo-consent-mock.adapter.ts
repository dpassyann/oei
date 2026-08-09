import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventPhotoConsentPort } from '../../domain/port/event/event-photo-consent.port';
import { createEventPhotoConsent, EventPhotoConsent } from '../../domain/model/event/event-photo-consent';

const DEMO_MEMBER_ID = 'demo-member-1';

@Service()
export class EventPhotoConsentMockAdapter implements EventPhotoConsentPort {
  private readonly consents: EventPhotoConsent[] = [];

  hasConsented(eventId: string): Observable<boolean> {
    return of(this.consents.some((consent) => consent.eventId === eventId && consent.memberId === DEMO_MEMBER_ID));
  }

  giveConsent(eventId: string): Observable<EventPhotoConsent> {
    const existing = this.consents.find(
      (consent) => consent.eventId === eventId && consent.memberId === DEMO_MEMBER_ID,
    );
    if (existing) {
      return of(existing);
    }
    const consent = createEventPhotoConsent({
      eventId,
      memberId: DEMO_MEMBER_ID,
      consentedAt: new Date().toISOString(),
    });
    this.consents.push(consent);
    return of(consent);
  }
}
