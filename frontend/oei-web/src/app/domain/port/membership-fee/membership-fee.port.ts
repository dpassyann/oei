import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MembershipFeeAccount } from '../../model/membership-fee/membership-fee-account';
import { MembershipFeePayment } from '../../model/membership-fee/membership-fee-payment';
import { MembershipFeeTier } from '../../model/membership-fee/membership-fee-tier';

export interface MembershipFeePaymentRequest {
  readonly tier: MembershipFeeTier;
  readonly cycleYear: number;
  /** Prorated amount computed client-side (see `prorated-fee.ts`) and sent along so a real
   * backend can verify it — never trusted blindly, but this is a mocked payment with no
   * real processor, so no server-side recomputation exists yet. */
  readonly amount: number;
}

export interface MembershipFeePort {
  /** Raw account facts (tier + payment history) — no cycle/date reasoning; see
   * `buildMembershipFeeStatus` for how the application service derives the current status. */
  getAccount(): Observable<MembershipFeeAccount>;
  /** Simulates a successful cotisation payment (mocked — no real payment processor). */
  payFee(request: MembershipFeePaymentRequest): Observable<MembershipFeePayment>;
}

export const MEMBERSHIP_FEE_PORT = new InjectionToken<MembershipFeePort>('MembershipFeePort');
