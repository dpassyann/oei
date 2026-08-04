import { MembershipFeeAccount } from './membership-fee-account';
import { isWithinReminderWindow, MembershipFeeCycle, resolveFeeCycle } from './membership-fee-cycle';
import { annualFeeForTier } from './membership-fee-tier';
import { calculateProratedFee } from './prorated-fee';

// View model combining raw account facts with the current-cycle reasoning: whether the
// member is up to date, the reminder banner, and — when unpaid — the prorated amount they'd
// owe if they paid "now" (`referenceDate`).
export interface MembershipFeeStatus {
  readonly memberId: string;
  readonly account: MembershipFeeAccount;
  readonly cycle: MembershipFeeCycle;
  readonly isPaid: boolean;
  readonly reminderActive: boolean;
  /** Prorated amount due for the current cycle if `isPaid` is false; `0` if already paid. */
  readonly amountDue: number;
  /** Remaining months (out of 12) used to justify `amountDue`; `0` if already paid. */
  readonly monthsRemaining: number;
}

/** Pure composition: given the account's raw payment history and "now", derive the full
 * membership-fee status view. Kept as a pure function (not a method on the application
 * service) so it is unit-testable without any DI/Observable plumbing. */
export function buildMembershipFeeStatus(account: MembershipFeeAccount, referenceDate: Date): MembershipFeeStatus {
  const cycle = resolveFeeCycle(referenceDate);
  const isPaid = account.payments.some((payment) => payment.cycleYear === cycle.year && payment.status === 'PAID');
  const reminderActive = !isPaid && isWithinReminderWindow(cycle, referenceDate);

  if (isPaid) {
    return { memberId: account.memberId, account, cycle, isPaid, reminderActive, amountDue: 0, monthsRemaining: 0 };
  }

  const annualFee = annualFeeForTier(account.tier);
  const { amount, monthsRemaining } = calculateProratedFee(annualFee, referenceDate, cycle);
  return { memberId: account.memberId, account, cycle, isPaid, reminderActive, amountDue: amount, monthsRemaining };
}
