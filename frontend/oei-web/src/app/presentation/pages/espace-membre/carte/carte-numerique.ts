import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { ProfessionalProfileApplicationService } from '../../../../application/service/professional-profile-application.service';
import { DigitalBusinessCardApplicationService } from '../../../../application/service/digital-business-card-application.service';
import { WalletApplicationService } from '../../../../application/service/wallet-application.service';
import { MembershipEntitlementService } from '../../../../application/service/membership-entitlement.service';
import { MembershipTier } from '../../../../domain/model/membership/membership';
import { WalletPass, WalletPassProvider } from '../../../../domain/model/wallet/wallet-pass';
import { I18nService } from '../../../i18n/i18n.service';

// Cosmetic only — mirrors the tier badge coloring used elsewhere for mocked wallet passes
// (see `WalletMockAdapter`'s `SILVER_LEVEL_COLOR`), just enough to give the card a visual
// identity per membership tier without a full design system.
const TIER_COLORS: Record<MembershipTier, string> = {
  STANDARD: '#5b6b82',
  SILVER: '#c0c0c0',
  GOLD: '#d4af37',
  FOUNDING: '#0a1e3f',
  HONORARY: '#7b3fa0',
  INSTITUTIONAL_AFFILIATE: '#1f7a5c',
};

@Component({
  selector: 'oei-carte-numerique',
  templateUrl: './carte-numerique.html',
  styleUrl: './carte-numerique.scss',
  // Component-scoped (not root-singleton) — see `MembershipAccessService`'s doc comment
  // (`MembershipEntitlementService` mirrors the same reasoning, also used this way in
  // `CvBuilder`/`PublierArticle`).
  providers: [MembershipEntitlementService],
})
export class CarteNumerique {
  private readonly memberApplicationService = inject(MemberApplicationService);
  private readonly membershipApplicationService = inject(MembershipApplicationService);
  private readonly professionalProfileApplicationService = inject(ProfessionalProfileApplicationService);
  private readonly digitalBusinessCardApplicationService = inject(DigitalBusinessCardApplicationService);
  private readonly walletApplicationService = inject(WalletApplicationService);
  protected readonly entitlements = inject(MembershipEntitlementService);
  protected readonly i18n = inject(I18nService);

  private readonly memberResource = rxResource({
    stream: () => this.memberApplicationService.getCurrentMember(),
  });
  protected readonly member = computed(() => this.memberResource.value());

  private readonly membershipResource = rxResource({
    stream: () => this.membershipApplicationService.getMembership(),
  });
  protected readonly membership = computed(() => this.membershipResource.value());

  // Also fetching the professional profile purely for its optional `title` line on the
  // card (spec allows a card without a title — this is the richer, still-simple option,
  // documented per task instructions).
  private readonly profileResource = rxResource({
    stream: () => this.professionalProfileApplicationService.getProfile(),
  });
  protected readonly profile = computed(() => this.profileResource.value());

  private readonly cardResource = rxResource({
    stream: () => this.digitalBusinessCardApplicationService.generateCard(),
  });
  protected readonly card = computed(() => this.cardResource.value());

  private readonly passesResource = rxResource({
    stream: () => this.walletApplicationService.listPasses(),
  });
  protected readonly passes = computed<WalletPass[]>(() => this.passesResource.value() ?? []);

  protected readonly isFullScreen = signal(false);
  // Separate from `isFullScreen` (which enlarges the whole card): this is the "tap the QR to
  // see it full-screen" modal required for mobile (spec §"UX mobile") — a plain overlay, no
  // dedicated modal library needed for something this simple.
  protected readonly qrModalOpen = signal(false);
  protected readonly shareFeedback = signal<'shared' | 'copied' | 'failed' | null>(null);
  protected readonly issuingProvider = signal<WalletPassProvider | null>(null);
  protected readonly issueError = signal(false);
  // Set right after a successful `issueApplePass`/`issueGooglePass` call, so the template
  // can show the mandatory, unambiguous "this is a demo, not a real pass / ID" notice and a
  // small visual preview of the just-issued pass.
  protected readonly justIssuedProvider = signal<WalletPassProvider | null>(null);
  protected readonly justIssuedPass = signal<WalletPass | null>(null);

  // Gates the Apple/Google Wallet issuance CTAs (doc §Entitlements: `WALLET_PASS`) — e.g. an
  // `EXPIRED` membership can still view/revoke its existing passes but not issue new ones.
  protected readonly canIssueWalletPass = computed(() => this.entitlements.has('WALLET_PASS'));

  protected tierColor(tier: MembershipTier): string {
    return TIER_COLORS[tier];
  }

  protected tierLabel(tier: MembershipTier): string {
    return this.i18n.translate(`espaceMembre.carte.tier.${tier}`);
  }

  protected passStatusLabel(status: WalletPass['status']): string {
    return this.i18n.translate(`espaceMembre.carte.wallet.passStatus.${status}`);
  }

  protected providerLabel(provider: WalletPassProvider): string {
    return this.i18n.translate(`espaceMembre.carte.wallet.provider.${provider}`);
  }

  protected toggleFullScreen(): void {
    this.isFullScreen.update((value) => !value);
  }

  protected openQrModal(): void {
    this.qrModalOpen.set(true);
  }

  protected closeQrModal(): void {
    this.qrModalOpen.set(false);
  }

  protected async share(): Promise<void> {
    const card = this.card();
    const member = this.member();
    if (!card) {
      return;
    }
    // The public URL is the card's own public page (`/card/{slug}`), not the private
    // management page the member is currently on — absolute so it's meaningful once shared
    // outside this browser tab. `window` is guarded for non-browser test/SSR environments.
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/card/${card.publicSlug}`;
    const shareData = {
      title: this.i18n.translate('espaceMembre.carte.share.title'),
      text: member?.displayName ?? '',
      url,
    };

    // Defensive `'share' in navigator` feature check (same pattern used elsewhere in this
    // repo for optional browser APIs) — falls back to clipboard copy when unavailable.
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator & { share: (data: typeof shareData) => Promise<void> }).share(shareData);
        this.shareFeedback.set('shared');
        return;
      } catch {
        // User cancelled the native share sheet or it failed — fall through to clipboard.
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        this.shareFeedback.set('copied');
        return;
      } catch {
        this.shareFeedback.set('failed');
        return;
      }
    }

    this.shareFeedback.set('failed');
  }

  protected issueApple(): void {
    this.issueProvider('APPLE', () => this.walletApplicationService.issueApplePass());
  }

  protected issueGoogle(): void {
    this.issueProvider('GOOGLE', () => this.walletApplicationService.issueGooglePass());
  }

  private issueProvider(provider: WalletPassProvider, issue: () => ReturnType<WalletApplicationService['issueApplePass']>): void {
    this.issuingProvider.set(provider);
    this.issueError.set(false);
    this.justIssuedProvider.set(null);
    this.justIssuedPass.set(null);
    issue().subscribe({
      next: (pass) => {
        this.issuingProvider.set(null);
        this.justIssuedProvider.set(provider);
        this.justIssuedPass.set(pass);
        this.passesResource.reload();
      },
      error: () => {
        this.issuingProvider.set(null);
        this.issueError.set(true);
      },
    });
  }

  protected revoke(id: string): void {
    this.walletApplicationService.revokePass(id).subscribe({
      next: () => this.passesResource.reload(),
    });
  }
}
