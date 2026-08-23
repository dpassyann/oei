import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MembershipEntitlementService } from './membership-entitlement.service';
import { MembershipApplicationService } from './membership-application.service';
import { Membership } from '../../domain/model/membership/membership';

function membershipFixture(overrides: Partial<Membership> = {}): Membership {
  return {
    memberId: 'demo-member-1',
    tier: 'SILVER',
    status: 'ACTIVE',
    startedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('MembershipEntitlementService', () => {
  function setup(membership: Membership): MembershipEntitlementService {
    const getMembership = vi.fn().mockReturnValue(of(membership));
    TestBed.configureTestingModule({
      providers: [MembershipEntitlementService, { provide: MembershipApplicationService, useValue: { getMembership } }],
    });
    return TestBed.inject(MembershipEntitlementService);
  }

  it('givenActiveMembership_whenLoaded_thenGrantsAllEntitlementsAndNoRenewalWarning', async () => {
    const service = setup(membershipFixture({ status: 'ACTIVE' }));
    await vi.waitFor(() => expect(service.status()).toBe('ACTIVE'));
    expect(service.has('CV_EXPORT_PDF')).toBe(true);
    expect(service.has('ARTICLE_SUBMIT')).toBe(true);
    expect(service.renewalImminent()).toBe(false);
  });

  it('givenExpiredMembership_whenLoaded_thenBlocksExportAndSubmitButKeepsProfileAndCvEdit', async () => {
    const service = setup(membershipFixture({ status: 'EXPIRED' }));
    await vi.waitFor(() => expect(service.status()).toBe('EXPIRED'));
    expect(service.has('CV_EXPORT_PDF')).toBe(false);
    expect(service.has('ARTICLE_SUBMIT')).toBe(false);
    expect(service.has('PROFILE_EDIT')).toBe(true);
    expect(service.has('CV_EDIT')).toBe(true);
  });

  it('givenGracePeriodMembership_whenLoaded_thenKeepsFullRightsButSignalsRenewalImminent', async () => {
    const service = setup(membershipFixture({ status: 'GRACE_PERIOD' }));
    await vi.waitFor(() => expect(service.status()).toBe('GRACE_PERIOD'));
    expect(service.has('CV_EXPORT_PDF')).toBe(true);
    expect(service.renewalImminent()).toBe(true);
  });

  it('givenSuspendedMembership_whenLoaded_thenGrantsOnlyProfileAndCvEdit', async () => {
    const service = setup(membershipFixture({ status: 'SUSPENDED' }));
    await vi.waitFor(() => expect(service.status()).toBe('SUSPENDED'));
    expect(service.has('PROFILE_EDIT')).toBe(true);
    expect(service.has('CV_EDIT')).toBe(true);
    expect(service.has('PROFILE_PUBLIC')).toBe(false);
    expect(service.has('MEMBER_DIRECTORY')).toBe(false);
  });

  it.each(['HONORARY', 'FOUNDING'] as const)(
    'givenStatus%s_whenLoaded_thenGrantsAllEntitlements',
    async (status) => {
      const service = setup(membershipFixture({ status }));
      await vi.waitFor(() => expect(service.status()).toBe(status));
      expect(service.has('CV_EXPORT_PDF')).toBe(true);
      expect(service.has('BUSINESS_CARD_ORDER')).toBe(true);
    },
  );

  it('givenPendingMembership_whenLoaded_thenGrantsOnlyProfileEditAndBlocksCvAndStore', async () => {
    const service = setup(membershipFixture({ status: 'PENDING' }));
    await vi.waitFor(() => expect(service.status()).toBe('PENDING'));
    expect(service.has('PROFILE_EDIT')).toBe(true);
    expect(service.has('CV_EDIT')).toBe(false);
    expect(service.has('STORE_ACCESS')).toBe(false);
  });

  it.each(['PENDING', 'SUSPENDED', 'EXPIRED'] as const)(
    'given%sMembership_whenLoaded_thenSignalsRestrictedAccess',
    async (status) => {
      const service = setup(membershipFixture({ status }));
      await vi.waitFor(() => expect(service.status()).toBe(status));
      expect(service.hasRestrictedAccess()).toBe(true);
    },
  );

  it.each(['ACTIVE', 'GRACE_PERIOD', 'HONORARY', 'FOUNDING'] as const)(
    'given%sMembership_whenLoaded_thenDoesNotSignalRestrictedAccess',
    async (status) => {
      const service = setup(membershipFixture({ status }));
      await vi.waitFor(() => expect(service.status()).toBe(status));
      expect(service.hasRestrictedAccess()).toBe(false);
    },
  );

  it('givenMembershipNotYetLoaded_whenCheckingEntitlement_thenDefaultsToNotEntitled', () => {
    const getMembership = vi.fn().mockReturnValue(of(membershipFixture()));
    TestBed.configureTestingModule({
      providers: [MembershipEntitlementService, { provide: MembershipApplicationService, useValue: { getMembership } }],
    });
    // Read synchronously, before the resource's microtask has a chance to settle.
    const service = TestBed.inject(MembershipEntitlementService);
    expect(service.has('CV_EXPORT_PDF')).toBe(false);
  });

  it('givenMembershipLoadFailure_whenCheckingEntitlements_thenDoesNotThrowAndSignalsFailure', async () => {
    const getMembership = vi.fn().mockReturnValue(throwError(() => new Error('boom')));
    TestBed.configureTestingModule({
      providers: [MembershipEntitlementService, { provide: MembershipApplicationService, useValue: { getMembership } }],
    });

    const service = TestBed.inject(MembershipEntitlementService);

    await vi.waitFor(() => expect(service.loadFailed()).toBe(true));
    expect(service.status()).toBeUndefined();
    expect(service.has('CV_EXPORT_PDF')).toBe(false);
    expect(service.hasRestrictedAccess()).toBe(false);
  });
});
