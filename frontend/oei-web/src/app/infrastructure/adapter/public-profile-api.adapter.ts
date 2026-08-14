import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { PublicProfilePort } from '../../domain/port/profile/public-profile.port';
import { PublicProfile, PublicProfilePublication } from '../../domain/model/profile/public-profile';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const PUBLIC_PROFILE_API_BASE = '/api/member/v1';

// Public (unauthenticated) endpoint base for the by-slug lookup — confirmed OpenAPI
// contract: `GET /api/public/v1/members/{publicSlug}` (`getPublicMemberProfile`) returns
// the `PublicProfile` schema directly.
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

  // `GET /api/public/v1/members/{publicSlug}` (`getPublicMemberProfile`), with its
  // documented 404 mapped to `null` rather than propagated as an error.
  getBySlug(publicSlug: string): Observable<PublicProfile | null> {
    return this.http.get<PublicProfile>(`${PUBLIC_API_BASE}/members/${publicSlug}`).pipe(catchError(() => of(null)));
  }
}
