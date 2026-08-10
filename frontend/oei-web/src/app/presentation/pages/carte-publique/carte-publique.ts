import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DigitalBusinessCardApplicationService } from '../../../application/service/digital-business-card-application.service';
import { MembershipTier } from '../../../domain/model/membership/membership';
import { I18nService } from '../../i18n/i18n.service';

// Cosmetic only, same values as `CarteNumerique`'s `TIER_COLORS` — kept as a small local
// duplicate rather than a shared cross-cutting util, since this is purely a color mapping
// with no behavior.
const TIER_COLORS: Record<MembershipTier, string> = {
  STANDARD: '#5b6b82',
  SILVER: '#c0c0c0',
  GOLD: '#d4af37',
  FOUNDING: '#0a1e3f',
  HONORARY: '#7b3fa0',
  INSTITUTIONAL_AFFILIATE: '#1f7a5c',
};

interface SocialLinkEntry {
  // Proper-noun brand names (LinkedIn, GitHub, X, YouTube) are not translated — same rule
  // documented in `SiteFooter`'s `SocialLink` interface. "Website" is the one generic label
  // and IS translated via `cardPublic.socialLinksTitle`'s sibling key handling below.
  readonly name: 'LinkedIn' | 'GitHub' | 'X' | 'YouTube' | 'Website';
  readonly href: string;
}

// Public, unauthenticated rendering of a member's digital business card (`/card/{slug}`,
// spec `07-WALLET.md` §"Page publique de la carte"). Mirrors `ProfilPublic`'s pattern for a
// public-by-slug page: `DigitalBusinessCardPort.getPublicCard` resolves to `null` (not an
// error) when the slug has no published card, so "not found" is a value state.
@Component({
  selector: 'oei-carte-publique',
  imports: [RouterLink],
  templateUrl: './carte-publique.html',
  styleUrl: './carte-publique.scss',
})
export class CartePublique {
  private readonly route = inject(ActivatedRoute);
  private readonly cardService = inject(DigitalBusinessCardApplicationService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  protected readonly i18n = inject(I18nService);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  private readonly cardResource = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.cardService.getPublicCard(params),
  });

  protected readonly card = computed(() => this.cardResource.value() ?? undefined);
  protected readonly notFound = computed(() => this.cardResource.hasValue() && this.cardResource.value() === null);

  protected readonly qrModalOpen = signal(false);
  protected readonly shareFeedback = signal<'shared' | 'copied' | 'failed' | null>(null);

  protected readonly socialLinks = computed<readonly SocialLinkEntry[]>(() => {
    const links = this.card()?.socialLinks;
    if (!links) {
      return [];
    }
    const entries: SocialLinkEntry[] = [];
    if (links.linkedin) {
      entries.push({ name: 'LinkedIn', href: links.linkedin });
    }
    if (links.github) {
      entries.push({ name: 'GitHub', href: links.github });
    }
    if (links.x) {
      entries.push({ name: 'X', href: links.x });
    }
    if (links.youtube) {
      entries.push({ name: 'YouTube', href: links.youtube });
    }
    if (links.website) {
      entries.push({ name: 'Website', href: links.website });
    }
    return entries;
  });

  constructor() {
    // SEO basics whenever the resolved card changes — same pattern as `ProfilPublic`.
    effect(() => {
      const card = this.card();
      if (!card) {
        return;
      }
      this.title.setTitle(`${card.displayName ?? card.publicSlug} — Carte OEI`);
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    });
  }

  protected tierLabel(tier: MembershipTier): string {
    return this.i18n.translate(`cardPublic.tier.${tier}`);
  }

  protected tierColor(tier: MembershipTier): string {
    return TIER_COLORS[tier];
  }

  protected openQrModal(): void {
    this.qrModalOpen.set(true);
  }

  protected closeQrModal(): void {
    this.qrModalOpen.set(false);
  }

  protected async share(): Promise<void> {
    const card = this.card();
    if (!card) {
      return;
    }
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: this.i18n.translate('cardPublic.share.title'),
      text: card.displayName ?? card.publicSlug,
      url,
    };

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
}
