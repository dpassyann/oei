import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PublicProfilePort } from '../../domain/port/profile/public-profile.port';
import { PublicProfile, PublicProfilePublication } from '../../domain/model/profile/public-profile';

// Demonstration public profile for `demo-jane-dupont` — same memberId/publicSlug as
// `DEMO_MEMBER` in `member-mock.adapter.ts` so the whole mocked member space stays
// consistent.
export const DEMO_PUBLIC_PROFILE: PublicProfile = {
  memberId: 'demo-member-1',
  publicSlug: 'demo-jane-dupont',
  visibleFields: ['title', 'summary', 'expertiseAreas', 'languages', 'membershipTier'],
  seoDescription: 'Experte en éthique de l’intelligence artificielle — profil de démonstration OEI.',
  publishedAt: '2026-02-01T10:00:00Z',
  viewsCount: 42,
};

@Service()
export class PublicProfileMockAdapter implements PublicProfilePort {
  getMyPublicProfile(): Observable<PublicProfile> {
    return of(DEMO_PUBLIC_PROFILE);
  }

  publish(publication: PublicProfilePublication): Observable<PublicProfile> {
    return of({
      ...publication,
      memberId: 'demo-member-1',
      viewsCount: 0,
      publishedAt: new Date().toISOString(),
    });
  }

  getBySlug(publicSlug: string): Observable<PublicProfile | null> {
    return of(publicSlug === DEMO_PUBLIC_PROFILE.publicSlug ? DEMO_PUBLIC_PROFILE : null);
  }
}
