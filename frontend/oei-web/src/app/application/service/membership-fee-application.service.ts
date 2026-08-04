import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MEMBERSHIP_FEE_PORT } from '../../domain/port/membership-fee/membership-fee.port';
import { MembershipFeePayment } from '../../domain/model/membership-fee/membership-fee-payment';
import { MembershipFeeStatus, buildMembershipFeeStatus } from '../../domain/model/membership-fee/membership-fee-status';
import { resolveFeeCycle } from '../../domain/model/membership-fee/membership-fee-cycle';
import { annualFeeForTier } from '../../domain/model/membership-fee/membership-fee-tier';
import { calculateProratedFee } from '../../domain/model/membership-fee/prorated-fee';

@Service()
export class MembershipFeeApplicationService {
  private readonly port = inject(MEMBERSHIP_FEE_PORT);

  /** Current membership-fee status (cycle, paid/unpaid, reminder, prorated amount due),
   * evaluated against `referenceDate` (defaults to "now" — overridable for tests). */
  getStatus(referenceDate: Date = new Date()): Observable<MembershipFeeStatus> {
    return this.port.getAccount().pipe(map((account) => buildMembershipFeeStatus(account, referenceDate)));
  }

  /** Pays the current cycle's prorated cotisation (mocked — always simulates success). */
  payCurrentCycle(referenceDate: Date = new Date()): Observable<MembershipFeePayment> {
    return this.port.getAccount().pipe(
      switchMap((account) => {
        const cycle = resolveFeeCycle(referenceDate);
        const annualFee = annualFeeForTier(account.tier);
        const { amount } = calculateProratedFee(annualFee, referenceDate, cycle);
        return this.port.payFee({ tier: account.tier, cycleYear: cycle.year, amount });
      }),
    );
  }
}
