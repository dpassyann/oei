import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EventPhotoConsent } from '../../model/event/event-photo-consent';

// Not part of the task's literal 9-endpoint list — an explicit, dedicated consent gate the spec
// requires before a member's first photo publication on a given event's feed ("Consentement"
// section). Kept as its own port/adapter (rather than folded into `EventFeedPort`) so the
// consent record's lifecycle (once per member per event) stays independent of individual posts.
export interface EventPhotoConsentPort {
  hasConsented(eventId: string): Observable<boolean>;
  giveConsent(eventId: string): Observable<EventPhotoConsent>;
}

export const EVENT_PHOTO_CONSENT_PORT = new InjectionToken<EventPhotoConsentPort>('EventPhotoConsentPort');
