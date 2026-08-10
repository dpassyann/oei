import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { WalletApplicationService } from '../../../application/service/wallet-application.service';
import { WalletPassStatus } from '../../../domain/model/wallet/wallet-pass';
import { I18nService } from '../../i18n/i18n.service';

// Public, unauthenticated wallet-pass verification page (`/verify/member/{token}`, spec
// `07-WALLET.md` §"Page de vérification"). `token` is the pass's `serialNumber` — matches
// the OpenAPI `GET /api/public/v1/wallet/passes/{serialNumber}/verify` contract exactly
// (`WalletPort.verifyPass`). An unknown/expired token resolves to `null` (a value state,
// same pattern as `ProfilPublic`/`CartePublique`), never a crash or a false "verified".
//
// CRITICAL wording rule (doc `00-CONTEXTE-GLOBAL-OEI.md` / Livre Blanc's "Note liminaire"):
// the OEI must never be presented as a legally constituted professional order — this page's
// `walletVerification.disclaimer` copy repeats the same "mouvement fondateur, adossé à une
// association" nuance used throughout the Livre Blanc/Code de déontologie.
@Component({
  selector: 'oei-verification-membre',
  imports: [RouterLink],
  templateUrl: './verification-membre.html',
  styleUrl: './verification-membre.scss',
})
export class VerificationMembre {
  private readonly route = inject(ActivatedRoute);
  private readonly walletService = inject(WalletApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly token = toSignal(this.route.paramMap.pipe(map((params) => params.get('token') ?? '')), {
    initialValue: '',
  });

  private readonly verificationResource = rxResource({
    params: () => this.token(),
    stream: ({ params }) => this.walletService.verifyPass(params),
  });

  protected readonly loading = computed(() => !this.verificationResource.hasValue());
  protected readonly verification = computed(() => this.verificationResource.value() ?? undefined);
  // Both an unknown token (`null`) and a known-but-invalid one (`valid: false`, e.g. a
  // revoked pass) render the same clear "invalid" state — neither is ever shown as verified.
  protected readonly invalid = computed(() => {
    if (!this.verificationResource.hasValue()) {
      return false;
    }
    const result = this.verificationResource.value();
    return result === null || result.valid === false;
  });
  protected readonly verified = computed(() => this.verificationResource.value()?.valid === true);

  protected statusLabel(status: WalletPassStatus): string {
    return this.i18n.translate(`walletVerification.status.${status}`);
  }

  // `WalletPassVerification.tier` is a plain `string` (not the `MembershipTier` union) since
  // it comes back over the public, unauthenticated verification endpoint — kept loose here
  // rather than asserting a type the backend contract doesn't actually guarantee.
  protected tierLabel(tier: string): string {
    return this.i18n.translate(`walletVerification.tier.${tier}`);
  }
}
