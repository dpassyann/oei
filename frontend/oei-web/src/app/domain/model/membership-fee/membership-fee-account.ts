import { MembershipFeePayment } from './membership-fee-payment';
import { MembershipFeeTier } from './membership-fee-tier';

// Raw facts the adapter knows about, with no date/cycle reasoning applied — that reasoning
// (which cycle "now" belongs to, whether it's paid, the prorated amount if not) is a pure
// domain concern applied on top by `membership-fee-status.ts` / the application service, so
// the mock and API adapters both stay "dumb" data sources per this project's architecture.
export interface MembershipFeeAccount {
  readonly memberId: string;
  readonly tier: MembershipFeeTier;
  readonly payments: readonly MembershipFeePayment[];
}
