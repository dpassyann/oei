// Tier naming matches exactly the Keycloak composite roles `member-<tier-kebab-case>`
// documented in docs/architecture/keycloak-roles.md and the OpenAPI `MembershipTier`
// enum (openapi/oei-api.yaml) — do not rename without updating both.
export type MembershipTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'FOUNDING' | 'HONORARY' | 'INSTITUTIONAL_AFFILIATE';

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export interface Membership {
  readonly memberId: string;
  readonly tier: MembershipTier;
  readonly status: MembershipStatus;
  readonly startedAt: string;
  readonly renewedAt?: string | null;
  readonly endsAt?: string | null;
}

export function createMembership(fields: Membership): Membership {
  return Object.freeze({ ...fields });
}

export const MEMBERSHIP_TIERS: readonly MembershipTier[] = [
  'STANDARD',
  'SILVER',
  'GOLD',
  'FOUNDING',
  'HONORARY',
  'INSTITUTIONAL_AFFILIATE',
];
