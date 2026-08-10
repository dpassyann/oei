export interface PublicProfile {
  readonly memberId: string;
  readonly publicSlug: string;
  readonly visibleFields: readonly string[];
  readonly seoDescription?: string;
  readonly publishedAt?: string | null;
  readonly viewsCount: number;
}

export interface PublicProfilePublication {
  readonly publicSlug: string;
  readonly visibleFields: readonly string[];
  readonly seoDescription?: string;
}

export function createPublicProfile(fields: PublicProfile): PublicProfile {
  return Object.freeze({ ...fields });
}

// Field-level visibility toggles offered by the profile editor and the public-profile
// preview — kept centralized so both stay in sync with what `PublicProfile.visibleFields`
// can actually contain.
//
// `currentCompensation` (see `ProfessionalProfile`) is deliberately absent from this list —
// not just unchecked by default. There is no visibility toggle for it anywhere in the product,
// by design: it must never become publicly visible under any member setting.
export const PUBLIC_PROFILE_VISIBLE_FIELD_KEYS = [
  'title',
  'summary',
  'location',
  'expertiseAreas',
  'technologies',
  'sectors',
  'languages',
  'experiences',
  'educations',
  'certifications',
  'badges',
  'membershipTier',
  'socialLinks',
] as const;

export type PublicProfileVisibleFieldKey = (typeof PUBLIC_PROFILE_VISIBLE_FIELD_KEYS)[number];
