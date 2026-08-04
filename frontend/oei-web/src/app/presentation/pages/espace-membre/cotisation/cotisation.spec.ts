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
  translateList: () => [],
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

  it('givenUnpaidStatus_whenRendered_thenShowsProratedAmountAndJustification', async () => {
    configure(statusFixture({}));
    const fixture = TestBed.createComponent(Cotisation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('24.93');
    expect(compiled.textContent).toContain('6');
  });

  it('givenReminderActive_whenRendered_thenShowsReminderMessage', async () => {
    configure(statusFixture({ reminderActive: true }));
    const fixture = TestBed.createComponent(Cotisation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.oei-cotisation__reminder')).toBeTruthy();
  });

  it('givenPaidStatus_whenRendered_thenShowsUpToDatePanelInsteadOfPaymentForm', async () => {
    configure(statusFixture({ isPaid: true, amountDue: 0, monthsRemaining: 0 }));
    const fixture = TestBed.createComponent(Cotisation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.oei-cotisation__up-to-date')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.oei-cotisation__form')).toBeFalsy();
  });

  it('givenValidCardNumber_whenPay_thenSimulatesSuccessfulPayment', async () => {
    const { payCurrentCycle } = configure(statusFixture({}));
    const fixture = TestBed.createComponent(Cotisation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as CotisationTestHandle;
    component.cardNumber.set('4242 4242 4242 4242');
    component.pay();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(payCurrentCycle).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.oei-cotisation__payment-success')).toBeTruthy();
  });

  it('givenPaymentFails_whenPay_thenShowsErrorMessage', async () => {
    configure(statusFixture({}), vi.fn().mockReturnValue(throwError(() => new Error('boom'))));
    const fixture = TestBed.createComponent(Cotisation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as CotisationTestHandle;
    component.cardNumber.set('0000');
    component.pay();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('espaceMembre.cotisation.form.error');
  });
});
