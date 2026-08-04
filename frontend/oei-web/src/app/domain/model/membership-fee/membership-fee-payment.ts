import { MembershipFeeTier } from './membership-fee-tier';

export type MembershipFeePaymentStatus = 'PAID' | 'FAILED';

// A single cotisation payment, always for one specific annual cycle (`cycleYear`, the
// `MembershipFeeCycle.year` it settles). `amount` is the prorated amount actually charged
// (see `prorated-fee.ts`), not necessarily the full annual fee.
export interface MembershipFeePayment {
  readonly id: string;
  readonly memberId: string;
  readonly cycleYear: number;
  readonly tier: MembershipFeeTier;
  readonly amount: number;
  readonly status: MembershipFeePaymentStatus;
  readonly paidAt: string;
}

export function createMembershipFeePayment(fields: MembershipFeePayment): MembershipFeePayment {
  return Object.freeze({ ...fields });
}
