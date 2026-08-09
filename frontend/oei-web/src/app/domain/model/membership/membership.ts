// Tier naming matches exactly the Keycloak composite roles `member-<tier-kebab-case>`
// documented in docs/architecture/keycloak-roles.md and the OpenAPI `MembershipTier`
// enum (openapi/oei-api.yaml) — do not rename without updating both.
export type MembershipTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'FOUNDING' | 'HONORARY' | 'INSTITUTIONAL_AFFILIATE';

// Modelling decision (doc `01-MEMBERS-DYNAMIC-SPACE.md` §États): the spec lists `HONORARY`
// and `FOUNDING` alongside activity states (`PENDING`/`ACTIVE`/`GRACE_PERIOD`/`EXPIRED`/
// `SUSPENDED`), but this codebase already has `HONORARY`/`FOUNDING` as `MembershipTier`
// values — i.e. as the member's permanent *category*, not as a transient activity state.
// Collapsing the two would make it impossible to tell "this is a founding-tier member who
// happens to be mid-onboarding (`PENDING`)" from "this is a founding-tier member whose
// cotisation lapsed (`EXPIRED`)" — exactly the ambiguity the spec asks us to avoid.
//
// Decision: `MembershipTier` keeps its existing meaning (identity/category, effectively
// permanent) and stays the one place a caller checks "is this member honorary/founding?".
// `MembershipStatus` is extended with the missing activity states (`GRACE_PERIOD`,
// `EXPIRED`) *and*, additively, with `HONORARY`/`FOUNDING` as status values reserved for the
// lifetime-exempt case: a member whose `tier` is `HONORARY`/`FOUNDING` and who is granted
// full rights unconditionally, never gated by cotisation payment. Such a member's `status`
// is set to that same value by the backend once their honorary/founding membership is
// confirmed — before that (e.g. while the nomination is still being processed), their
// `status` can still be `PENDING`/`ACTIVE` like any other member, so "identifiable as
// honorary/founding" (via `tier`, always present) and "current activity/payment status"
// (via `status`) remain two independent, always-readable facts. `TERMINATED` is kept even
// though the spec's list omits it (definitive end of membership — resignation, expulsion —
// distinct from a merely lapsed `EXPIRED` cotisation); no existing code outside this file
// pattern-matches on the previous 4-value union, so widening it here is not a breaking change.
export type MembershipStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'GRACE_PERIOD'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'HONORARY'
  | 'FOUNDING'
  | 'TERMINATED';

export const MEMBERSHIP_STATUSES: readonly MembershipStatus[] = [
  'PENDING',
  'ACTIVE',
  'GRACE_PERIOD',
  'EXPIRED',
  'SUSPENDED',
  'HONORARY',
  'FOUNDING',
  'TERMINATED',
];

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
