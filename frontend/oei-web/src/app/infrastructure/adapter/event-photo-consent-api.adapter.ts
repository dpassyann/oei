import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { EventPhotoConsentPort } from '../../domain/port/event/event-photo-consent.port';
import { createEventPhotoConsent, EventPhotoConsent } from '../../domain/model/event/event-photo-consent';

const EVENT_MEMBER_API_BASE = '/api/member/v1';

@Service()
export class EventPhotoConsentApiAdapter implements EventPhotoConsentPort {
  private readonly http = inject(HttpClient);

  hasConsented(eventId: string): Observable<boolean> {
    return this.http.get<EventPhotoConsent>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/photo-consent`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  giveConsent(eventId: string): Observable<EventPhotoConsent> {
    return this.http
      .post<EventPhotoConsent>(`${EVENT_MEMBER_API_BASE}/events/${eventId}/photo-consent`, {})
      .pipe(map((consent) => createEventPhotoConsent(consent)));
  }
}
