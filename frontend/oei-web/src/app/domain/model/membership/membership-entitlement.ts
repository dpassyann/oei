import { MembershipStatus } from './membership';

// Rights gated by `MembershipEntitlementService`, per doc `01-MEMBERS-DYNAMIC-SPACE.md`
// §Entitlements. Kept as a flat union (mirrors `CvSectionType`/`MembershipTier` style in
// this bounded context) rather than a bitmask/flags object so call sites read as plain
// string checks (`entitlements.has('CV_EXPORT_PDF')`).
//
// AI-specific entitlements (AI_CV_IMPORT, AI_CV_REIMPORT, AI_PROFILE_TRANSLATION) gate the
// Smart CV Import pipeline (import-first onboarding). They are included in all active
// membership statuses and can also be granted via one-time purchase for non-members.
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
  | 'CERTIFICATION_BADGE'
  | 'STORE_ACCESS'
  | 'AI_CV_IMPORT'
  | 'AI_CV_REIMPORT'
  | 'AI_PROFILE_TRANSLATION';

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
  'STORE_ACCESS',
  'AI_CV_IMPORT',
  'AI_CV_REIMPORT',
  'AI_PROFILE_TRANSLATION',
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

// `SUSPENDED` — under disciplinary/administrative hold: only private profile/CV editing.
const SUSPENDED_ENTITLEMENTS: readonly MembershipEntitlement[] = ['PROFILE_EDIT', 'CV_EDIT'];

// `PENDING` (onboarding grace: first cotisation not yet paid).
// AI_CV_IMPORT is granted so the member can complete the import-first onboarding flow
// and create their profile before their first cotisation is confirmed.
const PENDING_ENTITLEMENTS: readonly MembershipEntitlement[] = ['PROFILE_EDIT', 'AI_CV_IMPORT'];

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
 * - `SUSPENDED`: the minimal set documented above (`PROFILE_EDIT` + `CV_EDIT`).
 * - `PENDING`: the onboarding-grace-period set documented above (`PROFILE_EDIT` only).
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
      return new Set(SUSPENDED_ENTITLEMENTS);
    case 'PENDING':
      return new Set(PENDING_ENTITLEMENTS);
    case 'TERMINATED':
      return new Set();
  }
}
