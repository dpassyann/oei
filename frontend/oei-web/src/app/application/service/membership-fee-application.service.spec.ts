import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MembershipFeeApplicationService } from './membership-fee-application.service';
import { MEMBERSHIP_FEE_PORT, MembershipFeePaymentRequest, MembershipFeePort } from '../../domain/port/membership-fee/membership-fee.port';
import { MembershipFeeAccount } from '../../domain/model/membership-fee/membership-fee-account';

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

describe('MembershipFeeApplicationService', () => {
  function setup(account: MembershipFeeAccount): { service: MembershipFeeApplicationService; payFee: ReturnType<typeof vi.fn> } {
    const payFee = vi.fn().mockImplementation((request: MembershipFeePaymentRequest) =>
      of({
        id: 'payment-1',
        memberId: account.memberId,
        cycleYear: request.cycleYear,
        tier: request.tier,
        amount: request.amount,
        status: 'PAID' as const,
        paidAt: '2026-10-22T00:00:00Z',
      }),
    );
    const port: MembershipFeePort = { getAccount: vi.fn().mockReturnValue(of(account)), payFee };
    TestBed.configureTestingModule({
      providers: [MembershipFeeApplicationService, { provide: MEMBERSHIP_FEE_PORT, useValue: port }],
    });
    return { service: TestBed.inject(MembershipFeeApplicationService), payFee };
  }

  const unpaidAccount: MembershipFeeAccount = { memberId: 'demo-member-1', tier: 'MEMBER', payments: [] };

  it('givenUnpaidAccount_whenGetStatus_thenReturnsProratedAmountDue', async () => {
    const { service } = setup(unpaidAccount);
    const status = await firstValueFrom(service.getStatus(utc(2026, 9, 22)));
    expect(status.isPaid).toBe(false);
    expect(status.amountDue).toBeCloseTo(24.93, 2);
  });

  it('givenUnpaidAccount_whenPayCurrentCycle_thenPaysProratedAmountForCurrentCycleYear', async () => {
    const { service, payFee } = setup(unpaidAccount);
    const payment = await firstValueFrom(service.payCurrentCycle(utc(2026, 9, 22)));
    expect(payFee).toHaveBeenCalledWith({ tier: 'MEMBER', cycleYear: 2026, amount: 24.93 });
    expect(payment.status).toBe('PAID');
  });
});
