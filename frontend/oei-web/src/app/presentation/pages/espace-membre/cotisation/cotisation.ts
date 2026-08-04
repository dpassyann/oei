import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MembershipFeeApplicationService } from '../../../../application/service/membership-fee-application.service';
import { FEE_TIER_GRID_INDEX } from '../../../../domain/model/membership-fee/membership-fee-tier';
import { I18nService } from '../../../i18n/i18n.service';

type PaymentFormStatus = 'idle' | 'submitting' | 'success' | 'error';

// Mocked cotisation payment page — reached either from the home hero button (authenticated
// visitor with an unpaid current cycle, see `home.ts`'s `onJoinClick`) or from the optional
// "Payer maintenant" choice at the end of `/inscription`. No real payment processor is
// involved: the form only simulates a successful charge (see
// `MembershipFeeMockAdapter.payFee`).
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

  protected readonly cardNumber = signal('');
  protected readonly paymentState = signal<PaymentFormStatus>('idle');

  protected readonly canPay = computed(() => this.cardNumber().trim().length > 0 && this.paymentState() !== 'submitting');

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
