import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DigitalBusinessCardPort } from '../../domain/port/wallet/digital-business-card.port';
import { DigitalBusinessCard } from '../../domain/model/wallet/digital-business-card';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const DIGITAL_BUSINESS_CARD_API_BASE = '/api/member/v1';

// Public (unauthenticated) endpoint base for the by-slug lookup — confirmed OpenAPI
// contract: `GET /api/public/v1/members/{publicSlug}/digital-card` (`getPublicDigitalCard`).
const PUBLIC_API_BASE = '/api/public/v1';

@Service()
export class DigitalBusinessCardApiAdapter implements DigitalBusinessCardPort {
  private readonly http = inject(HttpClient);

  generateCard(): Observable<DigitalBusinessCard> {
    return this.http.post<DigitalBusinessCard>(`${DIGITAL_BUSINESS_CARD_API_BASE}/digital-card`, {});
  }

  // `GET /api/public/v1/members/{publicSlug}/digital-card`, with its documented 404
  // (no published card for that slug) mapped to `null` rather than propagated as an error.
  getPublicCard(publicSlug: string): Observable<DigitalBusinessCard | null> {
    return this.http
      .get<DigitalBusinessCard>(`${PUBLIC_API_BASE}/members/${publicSlug}/digital-card`)
      .pipe(catchError(() => of(null)));
  }
}
