import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Cotisation } from './cotisation';
import { MembershipFeeApplicationService } from '../../../../application/service/membership-fee-application.service';
import { MembershipFeeStatus } from '../../../../domain/model/membership-fee/membership-fee-status';
import { I18nService } from '../../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => ['inclusion-1', 'inclusion-2'],
};

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

interface CotisationTestHandle {
  readonly cardNumber: { set(value: string): void };
  readonly cardExpiry: { set(value: string): void };
  readonly cardCvc: { set(value: string): void };
  readonly paymentMethod: { set(value: 'CARD' | 'PAYPAL'): void };
  onCardNumberChange(value: string): void;
  onCardExpiryChange(value: string): void;
  selectPaymentMethod(method: 'CARD' | 'PAYPAL'): void;
  pay(): void;
}

describe('Cotisation', () => {
  function configure(status: MembershipFeeStatus, payCurrentCycle = vi.fn().mockReturnValue(of({}))) {
    TestBed.configureTestingModule({
      imports: [Cotisation],
      providers: [
        provideRouter([]),
        {
          provide: MembershipFeeApplicationService,
          useValue: { getStatus: vi.fn().mockReturnValue(of(status)), payCurrentCycle },
        },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      ],
    });
    return { payCurrentCycle };
  }

  async function renderCheckout(status: MembershipFeeStatus, payCurrentCycle?: Parameters<typeof configure>[1]) {
    const handles = payCurrentCycle === undefined ? configure(status) : configure(status, payCurrentCycle);
    const fixture = TestBed.createComponent(Cotisation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, ...handles };
  }

  it('givenUnpaidStatus_whenRendered_thenShowsProratedAmountAndJustification', async () => {
    const { fixture } = await renderCheckout(statusFixture({}));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('24.93');
    expect(compiled.textContent).toContain('6');
  });

  it('givenReminderActive_whenRendered_thenShowsReminderMessage', async () => {
    const { fixture } = await renderCheckout(statusFixture({ reminderActive: true }));

    expect(fixture.nativeElement.querySelector('.oei-cotisation__reminder')).toBeTruthy();
  });

  it('givenPaidStatus_whenRendered_thenShowsUpToDatePanelInsteadOfCheckout', async () => {
    const { fixture } = await renderCheckout(statusFixture({ isPaid: true, amountDue: 0, monthsRemaining: 0 }));

    expect(fixture.nativeElement.querySelector('.oei-cotisation__up-to-date')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.oei-cotisation__checkout')).toBeFalsy();
  });

  it('givenUnpaidStatus_whenRendered_thenShowsTierComparisonWithCurrentTierBadged', async () => {
    const { fixture } = await renderCheckout(statusFixture({}));

    const currentItem = fixture.nativeElement.querySelector('.oei-cotisation__tier-item--current');
    expect(currentItem).toBeTruthy();
    expect(currentItem.querySelector('.oei-cotisation__tier-badge')).toBeTruthy();
  });

  it('givenCardNumberTyped_whenFormatting_thenGroupsDigitsAndDetectsBrand', async () => {
    const { fixture } = await renderCheckout(statusFixture({}));
    const component = fixture.componentInstance as unknown as CotisationTestHandle;

    component.onCardNumberChange('4242424242424242');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.oei-cotisation__card-number-input').value).toBe('4242 4242 4242 4242');
    expect(fixture.nativeElement.querySelector('.oei-cotisation__card-brand').textContent.trim()).toBe('VISA');
  });

  it('givenPayPalTabSelected_whenRendered_thenShowsPayPalPlaceholderInsteadOfCardFields', async () => {
    const { fixture } = await renderCheckout(statusFixture({}));
    const component = fixture.componentInstance as unknown as CotisationTestHandle;

    component.selectPaymentMethod('PAYPAL');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.oei-cotisation__paypal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.oei-cotisation__card-form')).toBeFalsy();
  });

  it('givenIncompleteCardForm_whenRendered_thenPayButtonIsDisabled', async () => {
    const { fixture } = await renderCheckout(statusFixture({}));

    const payButton = fixture.nativeElement.querySelector('.oei-cotisation__actions button[type="submit"]') as HTMLButtonElement;
    expect(payButton.disabled).toBe(true);
  });

  it('givenValidCardDetails_whenPay_thenSimulatesSuccessfulPayment', async () => {
    const { fixture, payCurrentCycle } = await renderCheckout(statusFixture({}));
    const component = fixture.componentInstance as unknown as CotisationTestHandle;

    component.onCardNumberChange('4242424242424242');
    component.onCardExpiryChange('1230');
    component.cardCvc.set('123');
    fixture.detectChanges();
    component.pay();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(payCurrentCycle).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.oei-cotisation__payment-success')).toBeTruthy();
  });

  it('givenPayPalTabSelected_whenPay_thenSimulatesSuccessfulPaymentWithoutCardDetails', async () => {
    const { fixture, payCurrentCycle } = await renderCheckout(statusFixture({}));
    const component = fixture.componentInstance as unknown as CotisationTestHandle;

    component.selectPaymentMethod('PAYPAL');
    fixture.detectChanges();
    component.pay();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(payCurrentCycle).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.oei-cotisation__payment-success')).toBeTruthy();
  });

  it('givenPaymentFails_whenPay_thenShowsErrorMessage', async () => {
    const { fixture } = await renderCheckout(statusFixture({}), vi.fn().mockReturnValue(throwError(() => new Error('boom'))));
    const component = fixture.componentInstance as unknown as CotisationTestHandle;

    component.selectPaymentMethod('PAYPAL');
    component.pay();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('espaceMembre.cotisation.form.error');
  });
});
