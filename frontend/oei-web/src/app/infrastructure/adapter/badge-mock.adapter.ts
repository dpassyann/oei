import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BadgePort } from '../../domain/port/badge/badge.port';
import { Badge, BadgeAward, createBadge, createBadgeAward } from '../../domain/model/badge/badge';

// Small catalog covering 5 of the 10 `INITIAL_BADGE_CODES`. Category mapping is a best-effort
// judgment call (not pinned by the functional spec per badge):
// - MEMBERSHIP: badges tied to joining/membership status (MEMBER, CHARTER_SIGNED).
// - RECOGNITION: badges tied to identity/profile trust signals (PROFILE_VERIFIED).
// - CONTRIBUTION: badges tied to active participation (CONTRIBUTOR, MENTOR).
const BADGE_MEMBER: Badge = createBadge({
  id: 'badge-member',
  code: 'MEMBER',
  name: 'Membre',
  description: "Badge attribué à l'adhésion à l'association.",
  category: 'MEMBERSHIP',
});

const BADGE_CHARTER_SIGNED: Badge = createBadge({
  id: 'badge-charter-signed',
  code: 'CHARTER_SIGNED',
  name: 'Charte signée',
  description: "Badge attribué à la signature de la charte de l'association.",
  category: 'MEMBERSHIP',
});

const BADGE_PROFILE_VERIFIED: Badge = createBadge({
  id: 'badge-profile-verified',
  code: 'PROFILE_VERIFIED',
  name: 'Profil vérifié',
  description: 'Badge attribué lorsque le profil du membre a été vérifié.',
  category: 'RECOGNITION',
});

const BADGE_CONTRIBUTOR: Badge = createBadge({
  id: 'badge-contributor',
  code: 'CONTRIBUTOR',
  name: 'Contributeur',
  description: 'Badge attribué pour une contribution au contenu ou aux travaux de l\'association.',
  category: 'CONTRIBUTION',
});

const BADGE_MENTOR: Badge = createBadge({
  id: 'badge-mentor',
  code: 'MENTOR',
  name: 'Mentor',
  description: "Badge attribué aux membres accompagnant d'autres membres.",
  category: 'CONTRIBUTION',
});

// Full mock catalog (exported for potential reuse by other mock adapters/tests).
export const BADGE_CATALOG: Badge[] = [
  BADGE_MEMBER,
  BADGE_CHARTER_SIGNED,
  BADGE_PROFILE_VERIFIED,
  BADGE_CONTRIBUTOR,
  BADGE_MENTOR,
];

const DEMO_BADGE_AWARDS: BadgeAward[] = [
  createBadgeAward({
    id: 'badge-award-1',
    badgeId: BADGE_MEMBER.id,
    memberId: 'demo-member-1',
    awardedAt: '2026-01-15T09:00:00Z',
    source: 'AUTOMATIC',
    revoked: false,
    badge: BADGE_MEMBER,
  }),
  createBadgeAward({
    id: 'badge-award-2',
    badgeId: BADGE_CHARTER_SIGNED.id,
    memberId: 'demo-member-1',
    awardedAt: '2026-01-16T10:00:00Z',
    source: 'AUTOMATIC',
    revoked: false,
    badge: BADGE_CHARTER_SIGNED,
  }),
  createBadgeAward({
    id: 'badge-award-3',
    badgeId: BADGE_PROFILE_VERIFIED.id,
    memberId: 'demo-member-1',
    awardedAt: '2026-02-01T12:00:00Z',
    source: 'AUTOMATIC',
    revoked: false,
    badge: BADGE_PROFILE_VERIFIED,
  }),
];

@Service()
export class BadgeMockAdapter implements BadgePort {
  listMyBadgeAwards(): Observable<BadgeAward[]> {
    return of(DEMO_BADGE_AWARDS);
  }
}
