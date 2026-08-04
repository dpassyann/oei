import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicProfile, PublicProfilePublication } from '../../model/profile/public-profile';

export interface PublicProfilePort {
  getMyPublicProfile(): Observable<PublicProfile>;
  publish(publication: PublicProfilePublication): Observable<PublicProfile>;
  // Not part of the OpenAPI `/api/member/v1/**` contract (which only exposes the
  // authenticated member's own public profile): the public page at `/membres/{slug}`
  // needs an unauthenticated-by-slug lookup. Modeled here as a pragmatic addition for
  // the demo; a real backend would likely expose this under `/api/public/v1/members/{slug}`.
  // Returns `null` when the slug does not resolve to a published profile.
  getBySlug(publicSlug: string): Observable<PublicProfile | null>;
}

export const PUBLIC_PROFILE_PORT = new InjectionToken<PublicProfilePort>('PublicProfilePort');
