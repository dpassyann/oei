import { MembershipFeeAccount } from './membership-fee-account';
import { buildMembershipFeeStatus } from './membership-fee-status';

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

describe('buildMembershipFeeStatus', () => {
  const account: MembershipFeeAccount = {
    memberId: 'demo-member-1',
    tier: 'MEMBER',
    payments: [
      {
        id: 'payment-2025',
        memberId: 'demo-member-1',
        cycleYear: 2025,
        tier: 'MEMBER',
        amount: 50,
        status: 'PAID',
        paidAt: '2025-04-22T09:00:00Z',
      },
    ],
  };

  it('givenPaymentForCurrentCycleYear_whenBuildStatus_thenIsPaidTrueAndNoAmountDue', () => {
    const status = buildMembershipFeeStatus(account, utc(2025, 9, 1)); // cycle year 2025 is paid
    expect(status.isPaid).toBe(true);
    expect(status.amountDue).toBe(0);
    expect(status.reminderActive).toBe(false);
  });

  it('givenNoPaymentForCurrentCycleYear_whenBuildStatus_thenIsPaidFalseAndAmountDueIsProrated', () => {
    const status = buildMembershipFeeStatus(account, utc(2026, 9, 22)); // cycle year 2026, unpaid
    expect(status.isPaid).toBe(false);
    expect(status.cycle.year).toBe(2026);
    expect(status.amountDue).toBeCloseTo(24.93, 2);
    expect(status.monthsRemaining).toBe(6);
  });

  it('givenUnpaidAndWithinReminderWindow_whenBuildStatus_thenReminderActiveTrue', () => {
    const status = buildMembershipFeeStatus(account, utc(2027, 2, 22)); // 22 March 2027, reminder window of cycle 2026
    expect(status.isPaid).toBe(false);
    expect(status.reminderActive).toBe(true);
  });

  it('givenUnpaidButOutsideReminderWindow_whenBuildStatus_thenReminderActiveFalse', () => {
    const status = buildMembershipFeeStatus(account, utc(2026, 5, 1)); // early in the cycle, well before 22 March next year
    expect(status.reminderActive).toBe(false);
  });
});
