import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { PublicProfilePort } from '../../domain/port/profile/public-profile.port';
import { PublicProfile, PublicProfilePublication } from '../../domain/model/profile/public-profile';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const PUBLIC_PROFILE_API_BASE = '/api/member/v1';

// Public (unauthenticated) endpoint base for the by-slug lookup. Not part of the current
// OpenAPI `/api/member/v1/**` contract — see the doc comment on `PublicProfilePort.getBySlug`
// for why this is a pragmatic, documented assumption/extension for the demo rather than a
// confirmed backend contract.
const PUBLIC_API_BASE = '/api/public/v1';

@Service()
export class PublicProfileApiAdapter implements PublicProfilePort {
  private readonly http = inject(HttpClient);

  getMyPublicProfile(): Observable<PublicProfile> {
    return this.http.get<PublicProfile>(`${PUBLIC_PROFILE_API_BASE}/public-profile`);
  }

  publish(publication: PublicProfilePublication): Observable<PublicProfile> {
    return this.http.post<PublicProfile>(`${PUBLIC_PROFILE_API_BASE}/public-profile/publish`, publication);
  }

  // Assumption/extension beyond the current OpenAPI contract (see the port's doc comment):
  // modeled as an unauthenticated `GET /api/public/v1/members/{slug}/public-profile`, with a
  // 404 (no published profile for that slug) mapped to `null` rather than propagated as an error.
  getBySlug(publicSlug: string): Observable<PublicProfile | null> {
    return this.http
      .get<PublicProfile>(`${PUBLIC_API_BASE}/members/${publicSlug}/public-profile`)
      .pipe(catchError(() => of(null)));
  }
}
