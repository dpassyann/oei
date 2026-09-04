import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FEE_TIER_GRID_INDEX,
  MEMBERSHIP_FEE_TIERS,
  MembershipFeeTier,
} from '../../../domain/model/membership-fee/membership-fee-tier';
import { PaymentMethod } from '../../../domain/model/payment/payment-method';
import { I18nService } from '../../i18n/i18n.service';

// Public plan-selection page reached from `/membres-fondateurs`'s CTA (see
// `membres-fondateurs.html`'s `oei-cta-join`). Compares the same 4 `MembershipFeeTier` values
// already published there (`membresFondateurs.feeTiers.tiers.<index>`, reused via
// `FEE_TIER_GRID_INDEX` rather than duplicated) with honest, non-technical advantage copy —
// see `adhesion.plans.<TIER>.advantages` in `public/i18n/*.json`.
//
// IMPORTANT — no differentiated backend entitlement exists yet: `MembershipEntitlement`
// (domain/model/membership/membership-entitlement.ts) only varies by `MembershipStatus`
// (ACTIVE/EXPIRED/SUSPENDED), not by which tier was paid. The advantage copy is therefore
// deliberately framed around symbolic recognition/contribution level (e.g. a founding-member
// badge), never around a feature that doesn't actually exist — see `adhesion.honestNote`.
@Component({
  selector: 'oei-adhesion',
  templateUrl: './adhesion.html',
  styleUrl: './adhesion.scss',
})
export class Adhesion {
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  protected readonly tiers = MEMBERSHIP_FEE_TIERS;
  protected readonly feeTierGridIndex = FEE_TIER_GRID_INDEX;

  // Native `<dialog>` + boolean-ish toggle, same pattern as `Profil`'s
  // `oei-onboarding-modal` (no reusable modal component/CDK Dialog exists in this codebase).
  // Holding the selected tier itself (rather than a separate boolean) doubles as both the
  // "is the modal open" flag and the payload the modal needs to render.
  protected readonly selectedTier = signal<MembershipFeeTier | null>(null);

  protected readonly selectedTierGridIndex = computed(() => {
    const tier = this.selectedTier();
    return tier ? this.feeTierGridIndex[tier] : null;
  });

  protected openPaymentMethodModal(tier: MembershipFeeTier): void {
    this.selectedTier.set(tier);
  }

  protected closeModal(): void {
    this.selectedTier.set(null);
  }

  // Confirming a method navigates to the checkout step, carrying the selected tier and method
  // forward as query params — see `AdhesionCheckout`, which is a clearly-labeled placeholder
  // (no real Stripe Elements/PayPal SDK yet, that integration is a separate future task).
  protected confirmMethod(method: PaymentMethod): void {
    const tier = this.selectedTier();
    if (!tier) {
      return;
    }
    void this.router.navigate(['/adhesion/finaliser'], { queryParams: { tier, method } });
  }
}
