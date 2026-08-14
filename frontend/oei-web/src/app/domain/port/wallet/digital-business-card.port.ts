import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DigitalBusinessCard } from '../../model/wallet/digital-business-card';

export interface DigitalBusinessCardPort {
  generateCard(): Observable<DigitalBusinessCard>;
  // Matches the confirmed OpenAPI `GET /api/public/v1/members/{publicSlug}/digital-card`
  // (`getPublicDigitalCard`) contract, used by the public card page at `/card/{slug}`.
  // Returns `null` when the slug has no published card (404).
  getPublicCard(publicSlug: string): Observable<DigitalBusinessCard | null>;
}

export const DIGITAL_BUSINESS_CARD_PORT = new InjectionToken<DigitalBusinessCardPort>('DigitalBusinessCardPort');
