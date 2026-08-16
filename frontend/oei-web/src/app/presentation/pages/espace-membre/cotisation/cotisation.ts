import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MembershipFeeApplicationService } from '../../../../application/service/membership-fee-application.service';
import { FEE_TIER_GRID_INDEX } from '../../../../domain/model/membership-fee/membership-fee-tier';
import {
  CardBrand,
  detectCardBrand,
  formatCardExpiry,
  formatCardNumber,
  isValidCardCvc,
  isValidCardExpiry,
  isValidCardNumber,
} from '../../../../domain/model/payment/card-number';
import { PaymentMethod } from '../../../../domain/model/payment/payment-method';
import { I18nService } from '../../../i18n/i18n.service';

type PaymentFormStatus = 'idle' | 'submitting' | 'success' | 'error';

// A Stripe-Checkout-style cotisation payment page (two-column layout: payment form on the
// left, sticky order summary on the right) — reached from the home hero button (authenticated
// visitor with an unpaid current cycle, see `home.ts`'s `onJoinClick`). Account creation itself
// happens on Keycloak's native registration screen (see `KeycloakAuthService.register()`); the
// former homemade `/inscription` Angular page's optional "Payer maintenant" choice no longer
// exists as such.
//
// IMPORTANT — still fully mocked: no real payment processor is involved yet (see
// `MembershipFeeMockAdapter.payFee`). The "Carte bancaire" tab below only *looks* like a real
// card-capture form — it validates format only (Luhn/expiry/CVC, see `domain/model/payment/
// card-number.ts`) and NEVER sends the raw card digits anywhere, not even to our own backend.
// Once the backend's real Stripe integration (`infrastructure-client`, built in parallel) is
// stabilized, this tab must be replaced by Stripe Elements (`@stripe/stripe-js`), which
// tokenizes the PAN client-side inside a Stripe-hosted iframe — a plain `<input>` for a card
// number is out of PCI-DSS scope for a merchant site in real API mode. The "PayPal" tab is
// likewise a styled placeholder for the real PayPal SDK button to come.
@Component({
  selector: 'oei-cotisation',
  imports: [FormsModule, RouterLink],
  templateUrl: './cotisation.html',
  styleUrl: './cotisation.scss',
})
export class Cotisation {
  private readonly membershipFeeService = inject(MembershipFeeApplicationService);
  protected readonly i18n = inject(I18nService);

  // Maps the tier to its index in `membresFondateurs.feeTiers.tiers` so this page reuses the
  // exact same localized tier label/amount grid already published on `/membres-fondateurs`
  // instead of duplicating it under a new i18n namespace.
  protected readonly feeTierGridIndex = FEE_TIER_GRID_INDEX;

  private readonly statusResource = rxResource({ stream: () => this.membershipFeeService.getStatus() });
  protected readonly status = computed(() => this.statusResource.value());
  protected readonly loading = computed(() => this.statusResource.isLoading());

  protected readonly paymentMethod = signal<PaymentMethod>('CARD');

  // Card tab fields — display-only strings that are formatted as the visitor types (see
  // `(ngModelChange)` handlers in the template) and never leave this component.
  protected readonly cardNumber = signal('');
  protected readonly cardExpiry = signal('');
  protected readonly cardCvc = signal('');
  protected readonly cardBrand = computed<CardBrand>(() => detectCardBrand(this.cardNumber()));

  protected readonly paymentState = signal<PaymentFormStatus>('idle');

  private readonly cardFormValid = computed(
    () =>
      isValidCardNumber(this.cardNumber()) &&
      isValidCardExpiry(this.cardExpiry()) &&
      isValidCardCvc(this.cardCvc(), this.cardBrand()),
  );

  // PayPal tab has no client-side fields to validate — it is a placeholder button for the real
  // PayPal SDK redirect flow, always enabled once a fee is due.
  protected readonly canPay = computed(() => {
    if (this.paymentState() === 'submitting') {
      return false;
    }
    return this.paymentMethod() === 'PAYPAL' || this.cardFormValid();
  });

  protected selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  protected onCardNumberChange(rawInput: string): void {
    this.cardNumber.set(formatCardNumber(rawInput));
  }

  protected onCardExpiryChange(rawInput: string): void {
    this.cardExpiry.set(formatCardExpiry(rawInput));
  }

  protected pay(): void {
    if (!this.canPay()) {
      return;
    }
    this.paymentState.set('submitting');
    this.membershipFeeService.payCurrentCycle().subscribe({
      next: () => {
        this.paymentState.set('success');
        this.statusResource.reload();
      },
      error: () => this.paymentState.set('error'),
    });
  }
}
