import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PublicProfileApplicationService } from '../../../../application/service/public-profile-application.service';
import { I18nService } from '../../../i18n/i18n.service';

@Component({
  selector: 'oei-profil-public',
  imports: [RouterLink],
  templateUrl: './profil-public.html',
  styleUrl: './profil-public.scss',
})
export class ProfilPublic {
  private readonly route = inject(ActivatedRoute);
  private readonly publicProfileService = inject(PublicProfileApplicationService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  protected readonly i18n = inject(I18nService);

  private readonly publicSlug = toSignal(this.route.paramMap.pipe(map((params) => params.get('publicSlug') ?? '')), {
    initialValue: '',
  });

  private readonly profileResource = rxResource({
    params: () => this.publicSlug(),
    stream: ({ params }) => this.publicProfileService.getBySlug(params),
  });

  // `getBySlug` resolves to `null` (not an error) when the slug doesn't match any published
  // profile, so "not found" is a value state, not `resource.error()`.
  protected readonly profile = computed(() => this.profileResource.value() ?? undefined);
  protected readonly notFound = computed(() => this.profileResource.hasValue() && this.profileResource.value() === null);

  protected readonly shareConfirmation = signal(false);

  constructor() {
    // Sets SEO basics (document title + meta description) whenever the resolved profile
    // changes. Guarded implicitly: `Title`/`Meta` are Angular services that no-op safely
    // outside a real DOM document only in the sense that Angular provides testing doubles
    // in TestBed — no extra `typeof document` guard is needed here since these services
    // already encapsulate that concern.
    effect(() => {
      const profile = this.profile();
      if (!profile) {
        return;
      }
      this.title.setTitle(`${profile.publicSlug} — Profil OEI`);
      if (profile.seoDescription) {
        this.meta.updateTag({ name: 'description', content: profile.seoDescription });
      }
    });
  }

  protected visibleFieldsLabel(): string {
    return (this.profile()?.visibleFields ?? []).join(', ');
  }

  // "Voir le QR" and "Télécharger le PDF" intentionally do not implement QR generation or
  // PDF rendering on this page: a QR code representing the digital business card lives on
  // the digital-card page, and PDF generation lives on the CV Builder page. Rather than
  // fake either feature here (which would violate the no-hardcoded-fake-claims rule), both
  // buttons are simple router links to the pages that actually own that behavior.
  protected share(): void {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const canUseWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    if (canUseWebShare) {
      void navigator.share({ url });
      return;
    }
    const canUseClipboard = typeof navigator !== 'undefined' && !!navigator.clipboard;
    if (canUseClipboard) {
      void navigator.clipboard.writeText(url).then(() => {
        this.shareConfirmation.set(true);
      });
    }
  }
}
