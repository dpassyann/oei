import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MembershipFeePort, MembershipFeePaymentRequest } from '../../domain/port/membership-fee/membership-fee.port';
import { MembershipFeeAccount } from '../../domain/model/membership-fee/membership-fee-account';
import { MembershipFeePayment } from '../../domain/model/membership-fee/membership-fee-payment';
import { resolveFeeCycle } from '../../domain/model/membership-fee/membership-fee-cycle';

const DEMO_MEMBER_ID = 'demo-member-1';

// Honest demo scenario, deliberately NOT hardcoded to a paid-through year: the seeded
// payment is always for the cycle *before* the current one (computed from the real clock),
// so the demo member always starts in the "cotisation not paid for the current cycle" state
// — the exact scenario the product spec asks to demonstrate (reminder banner, read-only
// espace membre, prorated payment page). Paying via `payFee()` below then flips the demo to
// the "up to date" state within the same session, letting a reviewer see both cases without
// a multi-member switcher (this app models a single "current member" session throughout).
function seedPayments(): MembershipFeePayment[] {
  const previousCycleYear = resolveFeeCycle(new Date()).year - 1;
  return [
    {
      id: 'demo-fee-payment-previous-cycle',
      memberId: DEMO_MEMBER_ID,
      cycleYear: previousCycleYear,
      tier: 'MEMBER',
      amount: 50,
      status: 'PAID',
      paidAt: new Date(Date.UTC(previousCycleYear, 3, 22)).toISOString(),
    },
  ];
}

@Service()
export class MembershipFeeMockAdapter implements MembershipFeePort {
  // Mutable in-memory demo state (see class doc comment above) — intentionally not `const`
  // since `payFee` appends to it, unlike every other read-only mock adapter in this app.
  private payments: MembershipFeePayment[] = seedPayments();
  private tier: MembershipFeeAccount['tier'] = 'MEMBER';

  getAccount(): Observable<MembershipFeeAccount> {
    return of({ memberId: DEMO_MEMBER_ID, tier: this.tier, payments: this.payments });
  }

  payFee(request: MembershipFeePaymentRequest): Observable<MembershipFeePayment> {
    const payment: MembershipFeePayment = {
      id: `demo-fee-payment-${crypto.randomUUID()}`,
      memberId: DEMO_MEMBER_ID,
      cycleYear: request.cycleYear,
      tier: request.tier,
      amount: request.amount,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    };
    this.payments = [...this.payments, payment];
    return of(payment);
  }
}
