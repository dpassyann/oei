import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MembershipAccessService } from './membership-access.service';
import { MembershipFeeApplicationService } from '../../application/service/membership-fee-application.service';
import { MembershipFeeStatus } from '../../domain/model/membership-fee/membership-fee-status';

function statusFixture(overrides: Partial<MembershipFeeStatus>): MembershipFeeStatus {
  return {
    memberId: 'demo-member-1',
    account: { memberId: 'demo-member-1', tier: 'MEMBER', payments: [] },
    cycle: {
      year: 2026,
      cycleStartDate: new Date('2026-04-22T00:00:00Z'),
      cycleEndDate: new Date('2027-04-21T00:00:00Z'),
      reminderStartDate: new Date('2027-03-22T00:00:00Z'),
      nextDueDate: new Date('2027-04-22T00:00:00Z'),
    },
    isPaid: false,
    reminderActive: false,
    amountDue: 24.93,
    monthsRemaining: 6,
    ...overrides,
  };
}

describe('MembershipAccessService', () => {
  function setup(status: MembershipFeeStatus): MembershipAccessService {
    const getStatus = vi.fn().mockReturnValue(of(status));
    TestBed.configureTestingModule({
      providers: [MembershipAccessService, { provide: MembershipFeeApplicationService, useValue: { getStatus } }],
    });
    return TestBed.inject(MembershipAccessService);
  }

  it('givenUnpaidStatus_whenStatusResolves_thenIsReadOnlyIsTrue', async () => {
    const service = setup(statusFixture({ isPaid: false }));
    await vi.waitFor(() => expect(service.status()).toBeDefined());
    expect(service.isReadOnly()).toBe(true);
  });

  it('givenPaidStatus_whenStatusResolves_thenIsReadOnlyIsFalse', async () => {
    const service = setup(statusFixture({ isPaid: true, amountDue: 0, monthsRemaining: 0 }));
    await vi.waitFor(() => expect(service.status()).toBeDefined());
    expect(service.isReadOnly()).toBe(false);
  });

  it('givenStatusNotYetLoaded_whenCheckingIsReadOnly_thenDefaultsToFalse', () => {
    const getStatus = vi.fn().mockReturnValue(of(statusFixture({ isPaid: false })).pipe());
    TestBed.configureTestingModule({
      providers: [MembershipAccessService, { provide: MembershipFeeApplicationService, useValue: { getStatus } }],
    });
    // Read synchronously, before the resource's microtask has a chance to settle.
    const service = TestBed.inject(MembershipAccessService);
    expect(service.isReadOnly()).toBe(false);
  });
});
