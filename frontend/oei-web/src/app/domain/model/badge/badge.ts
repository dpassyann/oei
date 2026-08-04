export type BadgeCategory = 'MEMBERSHIP' | 'CONTRIBUTION' | 'CERTIFICATION' | 'RECOGNITION';

export interface Badge {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly iconUrl?: string;
  readonly category: BadgeCategory;
}

export function createBadge(fields: Badge): Badge {
  return Object.freeze({ ...fields });
}

export type BadgeAwardSource = 'AUTOMATIC' | 'MANUAL' | 'INSTITUTION_PROPOSAL';

export interface BadgeAward {
  readonly id: string;
  readonly badgeId: string;
  readonly memberId: string;
  readonly awardedAt: string;
  readonly source: BadgeAwardSource;
  readonly awardedBy?: string | null;
  readonly revoked?: boolean;
  readonly revokedAt?: string | null;
  // Denormalized for display convenience in mock/demo data — mirrors the `Badge`
  // this award refers to, so components don't need a second lookup round-trip.
  readonly badge?: Badge;
}

export function createBadgeAward(fields: BadgeAward): BadgeAward {
  return Object.freeze({ ...fields });
}

// The 10 initial badges required by the functional spec ("Badges initiaux").
export const INITIAL_BADGE_CODES = [
  'MEMBER',
  'FOUNDING_MEMBER',
  'CHARTER_SIGNED',
  'PROFILE_VERIFIED',
  'IDENTITY_VERIFIED',
  'CONTRIBUTOR',
  'MENTOR',
  'AUTHOR',
  'REVIEWER',
  'ACTIVE_MEMBER',
] as const;
