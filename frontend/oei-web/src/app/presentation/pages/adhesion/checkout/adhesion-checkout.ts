import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { FEE_TIER_GRID_INDEX, MEMBERSHIP_FEE_TIERS, MembershipFeeTier } from '../../../../domain/model/membership-fee/membership-fee-tier';
import { PAYMENT_METHODS, PaymentMethod } from '../../../../domain/model/payment/payment-method';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { I18nService } from '../../../i18n/i18n.service';

function parseTier(raw: string | null): MembershipFeeTier | null {
  return raw && (MEMBERSHIP_FEE_TIERS as readonly string[]).includes(raw) ? (raw as MembershipFeeTier) : null;
}

function parseMethod(raw: string | null): PaymentMethod | null {
  return raw && (PAYMENT_METHODS as readonly string[]).includes(raw) ? (raw as PaymentMethod) : null;
}

// Deliberately NOT a reuse of `Cotisation` (`espace-membre/cotisation`): that page is scoped to
// an already-authenticated member paying their *current known* fee status via
// `MembershipFeeApplicationService.getStatus()` — it has no notion of an externally-chosen tier,
// and coupling it to one here would either silently fabricate a fake "current status" for an
// anonymous visitor or require backend changes, both out of scope for this task.
//
// This page is instead a clearly-labeled placeholder checkout step carrying the tier/method
// chosen in `Adhesion`'s payment-method modal forward via query params (`?tier=...&method=...`).
// It does NOT process any payment or fake a result — see `adhesion.checkout.deferredNotice` for
// exactly what remains to be built (Stripe Elements for `CARD`, the real PayPal SDK button for
// `PAYPAL`), same explicit deferral already documented on `Cotisation`.
@Component({
  selector: 'oei-adhesion-checkout',
  imports: [RouterLink],
  templateUrl: './adhesion-checkout.html',
  styleUrl: './adhesion-checkout.scss',
})
export class AdhesionCheckout {
  private readonly route = inject(ActivatedRoute);
  private readonly keycloakAuth = inject(KeycloakAuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly feeTierGridIndex = FEE_TIER_GRID_INDEX;

  protected readonly tier = toSignal(
    this.route.queryParamMap.pipe(map((params) => parseTier(params.get('tier')))),
    { initialValue: parseTier(this.route.snapshot.queryParamMap.get('tier')) },
  );

  protected readonly method = toSignal(
    this.route.queryParamMap.pipe(map((params) => parseMethod(params.get('method')))),
    { initialValue: parseMethod(this.route.snapshot.queryParamMap.get('method')) },
  );

  // Missing/invalid query params (e.g. direct URL navigation, or a stale bookmarked link after
  // the fee-tier grid changes) is a value state, not an error page — same "not found is a
  // value" convention as `CartePublique`.
  protected readonly hasValidSelection = computed(() => this.tier() !== null && this.method() !== null);

  protected readonly isAuthenticated = computed(() => this.keycloakAuth.isAuthenticated());

  protected startAccountCreation(): void {
    this.keycloakAuth.register();
  }
}
