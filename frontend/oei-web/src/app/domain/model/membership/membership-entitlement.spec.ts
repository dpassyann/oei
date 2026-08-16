import { describe, expect, it } from 'vitest';
import { computeMembershipEntitlements, MEMBERSHIP_ENTITLEMENTS, MembershipEntitlement } from './membership-entitlement';
import { MEMBERSHIP_STATUSES, MembershipStatus } from './membership';

// Truth table (status -> expected rights), matching doc `01-MEMBERS-DYNAMIC-SPACE.md`
// §Entitlements plus the documented decisions in `membership-entitlement.ts` for
// `GRACE_PERIOD`/`SUSPENDED`/`PENDING`/`TERMINATED`.
const EXPECTED: Record<MembershipStatus, readonly MembershipEntitlement[]> = {
  ACTIVE: [...MEMBERSHIP_ENTITLEMENTS],
  HONORARY: [...MEMBERSHIP_ENTITLEMENTS],
  FOUNDING: [...MEMBERSHIP_ENTITLEMENTS],
  GRACE_PERIOD: [...MEMBERSHIP_ENTITLEMENTS],
  EXPIRED: ['PROFILE_EDIT', 'PROFILE_PUBLIC', 'CV_EDIT', 'MEMBER_DIRECTORY'],
  SUSPENDED: ['PROFILE_EDIT', 'CV_EDIT'],
  PENDING: ['PROFILE_EDIT'],
  TERMINATED: [],
};

describe('computeMembershipEntitlements', () => {
  it.each(MEMBERSHIP_STATUSES)('givenStatus%s_whenComputed_thenMatchesTruthTable', (status) => {
    const entitlements = computeMembershipEntitlements(status);
    expect([...entitlements].sort()).toEqual([...EXPECTED[status]].sort());
  });

  it('givenExpired_whenChecked_thenBlocksExportAndSubmissionRights', () => {
    const entitlements = computeMembershipEntitlements('EXPIRED');
    expect(entitlements.has('CV_EXPORT_PDF')).toBe(false);
    expect(entitlements.has('BUSINESS_CARD_ORDER')).toBe(false);
    expect(entitlements.has('BUSINESS_CARD_EXPORT')).toBe(false);
    expect(entitlements.has('ARTICLE_SUBMIT')).toBe(false);
    expect(entitlements.has('WALLET_PASS')).toBe(false);
    expect(entitlements.has('CV_EDIT')).toBe(true);
    expect(entitlements.has('PROFILE_EDIT')).toBe(true);
  });

  it('givenActiveHonoraryOrFounding_whenChecked_thenGrantsEveryEntitlement', () => {
    for (const status of ['ACTIVE', 'HONORARY', 'FOUNDING'] as const) {
      const entitlements = computeMembershipEntitlements(status);
      for (const entitlement of MEMBERSHIP_ENTITLEMENTS) {
        expect(entitlements.has(entitlement)).toBe(true);
      }
    }
  });

  it('givenTerminated_whenChecked_thenGrantsNoEntitlement', () => {
    const entitlements = computeMembershipEntitlements('TERMINATED');
    expect(entitlements.size).toBe(0);
  });

  it('givenPending_whenChecked_thenGrantsOnlyProfileEditAndBlocksCvAndStore', () => {
    const entitlements = computeMembershipEntitlements('PENDING');
    expect(entitlements.has('PROFILE_EDIT')).toBe(true);
    expect(entitlements.has('CV_EDIT')).toBe(false);
    expect(entitlements.has('STORE_ACCESS')).toBe(false);
    expect(entitlements.has('PROFILE_PUBLIC')).toBe(false);
  });

  it('givenSuspended_whenChecked_thenStillGrantsCvEditButNotStoreAccess', () => {
    const entitlements = computeMembershipEntitlements('SUSPENDED');
    expect(entitlements.has('PROFILE_EDIT')).toBe(true);
    expect(entitlements.has('CV_EDIT')).toBe(true);
    expect(entitlements.has('STORE_ACCESS')).toBe(false);
  });

  it.each(['ACTIVE', 'HONORARY', 'FOUNDING', 'GRACE_PERIOD'] as const)(
    'given%s_whenChecked_thenGrantsStoreAccess',
    (status) => {
      expect(computeMembershipEntitlements(status).has('STORE_ACCESS')).toBe(true);
    },
  );

  it.each(['PENDING', 'SUSPENDED', 'EXPIRED', 'TERMINATED'] as const)(
    'given%s_whenChecked_thenBlocksStoreAccess',
    (status) => {
      expect(computeMembershipEntitlements(status).has('STORE_ACCESS')).toBe(false);
    },
  );
});
