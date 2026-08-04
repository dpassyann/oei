import { firstValueFrom } from 'rxjs';
import { MembershipFeeMockAdapter } from './membership-fee-mock.adapter';
import { resolveFeeCycle } from '../../domain/model/membership-fee/membership-fee-cycle';

describe('MembershipFeeMockAdapter', () => {
  it('givenDemoAccount_whenGetAccount_thenNoPaymentExistsForTheCurrentCycleYear', async () => {
    const adapter = new MembershipFeeMockAdapter();
    const account = await firstValueFrom(adapter.getAccount());
    const currentCycleYear = resolveFeeCycle(new Date()).year;
    expect(account.memberId).toBe('demo-member-1');
    expect(account.tier).toBe('MEMBER');
    expect(account.payments.some((payment) => payment.cycleYear === currentCycleYear && payment.status === 'PAID')).toBe(
      false,
    );
  });

  it('givenDemoAccount_whenGetAccount_thenAPreviousCycleYearIsAlreadyPaid', async () => {
    const adapter = new MembershipFeeMockAdapter();
    const account = await firstValueFrom(adapter.getAccount());
    expect(account.payments.some((payment) => payment.status === 'PAID')).toBe(true);
  });

  it('givenPaymentRequest_whenPayFee_thenReturnsPaidPaymentForRequestedCycleYear', async () => {
    const adapter = new MembershipFeeMockAdapter();
    const currentCycleYear = resolveFeeCycle(new Date()).year;
    const payment = await firstValueFrom(adapter.payFee({ tier: 'MEMBER', cycleYear: currentCycleYear, amount: 24.93 }));
    expect(payment.status).toBe('PAID');
    expect(payment.cycleYear).toBe(currentCycleYear);
    expect(payment.amount).toBe(24.93);
  });

  it('givenPaymentJustMade_whenGetAccountAgain_thenTheNewPaymentIsReflected', async () => {
    const adapter = new MembershipFeeMockAdapter();
    const currentCycleYear = resolveFeeCycle(new Date()).year;
    await firstValueFrom(adapter.payFee({ tier: 'MEMBER', cycleYear: currentCycleYear, amount: 50 }));
    const account = await firstValueFrom(adapter.getAccount());
    expect(account.payments.some((payment) => payment.cycleYear === currentCycleYear && payment.status === 'PAID')).toBe(
      true,
    );
  });
});
