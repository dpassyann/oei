import { MembershipStatus } from './membership';

// Rights gated by `MembershipEntitlementService`, per doc `01-MEMBERS-DYNAMIC-SPACE.md`
// §Entitlements. Kept as a flat union (mirrors `CvSectionType`/`MembershipTier` style in
// this bounded context) rather than a bitmask/flags object so call sites read as plain
// string checks (`entitlements.has('CV_EXPORT_PDF')`).
export type MembershipEntitlement =
  | 'PROFILE_EDIT'
  | 'PROFILE_PUBLIC'
  | 'CV_EDIT'
  | 'CV_EXPORT_PDF'
  | 'BUSINESS_CARD_EXPORT'
  | 'BUSINESS_CARD_ORDER'
  | 'ARTICLE_SUBMIT'
  | 'EVENT_POST'
  | 'MEMBER_DIRECTORY'
  | 'WALLET_PASS'
  | 'CERTIFICATION_BADGE';

export const MEMBERSHIP_ENTITLEMENTS: readonly MembershipEntitlement[] = [
  'PROFILE_EDIT',
  'PROFILE_PUBLIC',
  'CV_EDIT',
  'CV_EXPORT_PDF',
  'BUSINESS_CARD_EXPORT',
  'BUSINESS_CARD_ORDER',
  'ARTICLE_SUBMIT',
  'EVENT_POST',
  'MEMBER_DIRECTORY',
  'WALLET_PASS',
  'CERTIFICATION_BADGE',
];

const ALL_ENTITLEMENTS: readonly MembershipEntitlement[] = MEMBERSHIP_ENTITLEMENTS;

// `EXPIRED` (doc §EXPIRED): "autoriser login, profil, modification profil/CV, lecture
// publique — bloquer export CV, commande cartes, soumission article, renouvellement Wallet
// et avantages premium." `MEMBER_DIRECTORY` (public-read listing) is kept, matching "lecture
// publique"; everything export/order/submit/premium-only is dropped.
const EXPIRED_ENTITLEMENTS: readonly MembershipEntitlement[] = [
  'PROFILE_EDIT',
  'PROFILE_PUBLIC',
  'CV_EDIT',
  'MEMBER_DIRECTORY',
];

// `SUSPENDED`/`PENDING` (doc §Entitlements asks us to document the decision: "le plus
// restrictif"). Decision: a suspended member is under an active disciplinary/administrative
// hold — grant nothing except being able to see their own (private) profile/CV so they can
// still find and correct whatever triggered the hold; no public exposure (`PROFILE_PUBLIC`,
// `MEMBER_DIRECTORY`) and no premium action. `PENDING` (onboarding not yet complete — e.g.
// cotisation never paid a first time) is treated identically: nothing is unlocked until the
// membership is confirmed `ACTIVE`, but the member can still fill in their profile/CV while
// waiting, exactly like `SUSPENDED`, so onboarding progress isn't lost while waiting.
const SUSPENDED_OR_PENDING_ENTITLEMENTS: readonly MembershipEntitlement[] = ['PROFILE_EDIT', 'CV_EDIT'];

/**
 * Pure lookup: given a `MembershipStatus`, returns the full set of rights granted. Kept as a
 * pure function (not a method on the Angular service) so it is unit-testable without any
 * DI/Observable plumbing — same pattern as `buildMembershipFeeStatus`.
 *
 * - `ACTIVE`/`HONORARY`/`FOUNDING`: every entitlement (see `membership.ts`'s doc comment on
 *   why `HONORARY`/`FOUNDING` also exist as `MembershipStatus` values distinct from `tier`).
 * - `GRACE_PERIOD`: identical to `ACTIVE` — the doc leaves this open ("à toi de définir un
 *   comportement cohérent"); decision is to *not* degrade any right during the grace window
 *   (the member already had full access and a hard cutoff mid-grace would be a surprising
 *   regression) but to surface a "renewal imminent" warning instead, via
 *   `MembershipEntitlementService.renewalImminent()` — never silently, per the "message
 *   explicite plutôt qu'un échec silencieux" rule for anything user-visible.
 * - `EXPIRED`: the reduced set documented above.
 * - `SUSPENDED`/`PENDING`: the minimal set documented above.
 * - `TERMINATED`: nothing at all — membership has definitively ended.
 */
export function computeMembershipEntitlements(status: MembershipStatus): ReadonlySet<MembershipEntitlement> {
  switch (status) {
    case 'ACTIVE':
    case 'HONORARY':
    case 'FOUNDING':
    case 'GRACE_PERIOD':
      return new Set(ALL_ENTITLEMENTS);
    case 'EXPIRED':
      return new Set(EXPIRED_ENTITLEMENTS);
    case 'SUSPENDED':
    case 'PENDING':
      return new Set(SUSPENDED_OR_PENDING_ENTITLEMENTS);
    case 'TERMINATED':
      return new Set();
  }
}
