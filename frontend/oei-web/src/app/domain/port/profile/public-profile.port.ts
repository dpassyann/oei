import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicProfile, PublicProfilePublication } from '../../model/profile/public-profile';

export interface PublicProfilePort {
  getMyPublicProfile(): Observable<PublicProfile>;
  publish(publication: PublicProfilePublication): Observable<PublicProfile>;
  // Matches the confirmed OpenAPI `GET /api/public/v1/members/{publicSlug}`
  // (`getPublicMemberProfile`) contract, used by the public page at `/membres/{slug}`.
  // Returns `null` when the slug does not resolve to a published profile (404).
  getBySlug(publicSlug: string): Observable<PublicProfile | null>;
}

export const PUBLIC_PROFILE_PORT = new InjectionToken<PublicProfilePort>('PublicProfilePort');
