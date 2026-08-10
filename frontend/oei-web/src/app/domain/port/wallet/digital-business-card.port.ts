import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DigitalBusinessCard } from '../../model/wallet/digital-business-card';

export interface DigitalBusinessCardPort {
  generateCard(): Observable<DigitalBusinessCard>;
  // Not part of the original OpenAPI `/api/member/v1/**` contract (which only exposes the
  // authenticated member's own card): the public card page at `/card/{slug}` needs an
  // unauthenticated-by-slug lookup, mirroring `PublicProfilePort.getBySlug`'s documented
  // pragmatic-addition pattern. Returns `null` when the slug has no published card.
  getPublicCard(publicSlug: string): Observable<DigitalBusinessCard | null>;
}

export const DIGITAL_BUSINESS_CARD_PORT = new InjectionToken<DigitalBusinessCardPort>('DigitalBusinessCardPort');
