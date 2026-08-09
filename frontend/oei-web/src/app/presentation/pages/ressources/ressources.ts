import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadCaptureApplicationService } from '../../../application/service/lead-capture-application.service';
import { NgOptimizedImage } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';
import { ResourceCarousel, ResourceCarouselItem } from '../../components/resource-carousel/resource-carousel';

interface ResourceLink {
  // `key` is the structural identifier used to build the i18n path
  // `ressources.resourceList.items.<key>.label` — the label itself is never hardcoded here.
  readonly key: string;
  readonly path?: string;
  readonly fragment?: string;
}

type DownloadFormStatus = 'idle' | 'submitting' | 'success' | 'error';
type CoverKind = 'front' | 'back';

// Deliberately real: the actual byte size of `public/assets/livre-blanc/livre-blanc-oei.pdf`
// (see `ls -la` on that file). There is no backend yet to report this dynamically (see
// `MARKDOWN_ASSET_PORT`'s own comment on `/livre-blanc` for the same "no backend" situation),
// so it's hardcoded here rather than invented — same honesty rule `PublicationsMockAdapter`
// follows by returning `[]` instead of fake publications.
const LIVRE_BLANC_FILE_SIZE_BYTES = 1_155_484;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'oei-ressources',
  imports: [FormsModule, RouterLink, NgOptimizedImage, ResourceCarousel],
  templateUrl: './ressources.html',
  styleUrl: './ressources.scss',
})
export class Ressources {
  private readonly leadCapture = inject(LeadCaptureApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly frontCoverSrc = '/assets/livre-blanc/couverture-oei.svg';
  protected readonly backCoverSrc = '/assets/livre-blanc/quatrieme-couverture-oei.svg';

  protected readonly resourceLinks: readonly ResourceLink[] = [
    { key: 'deontologie', path: '/deontologie' },
    { key: 'referentiel' },
    { key: 'livreBlanc', fragment: 'livre-blanc' },
    { key: 'positions' },
    { key: 'rapports' },
  ];

  // Same 5 resources as `resourceLinks` above, enriched with the carousel's display metadata
  // (cover/type/version/language/file size/CTA — see `ResourceCarouselItem`). Only the two
  // resources that actually exist today (Livre Blanc, Code de déontologie) carry real
  // metadata; the other three stay `cta: 'pending'` exactly like their `resourceLinks` entry
  // (no path/fragment), consistent with `ressources.resourceList.pendingBadge` below.
  protected readonly carouselItems: readonly ResourceCarouselItem[] = [
    {
      key: 'livreBlanc',
      type: 'white-paper',
      coverImageUrl: this.frontCoverSrc,
      coverAlt: this.i18n.translate('ressources.livreBlanc.frontCoverAlt'),
      version: 'v1.0',
      language: this.i18n.currentLang(),
      fileSizeBytes: LIVRE_BLANC_FILE_SIZE_BYTES,
      cta: 'email',
    },
    {
      key: 'deontologie',
      type: 'code-of-ethics',
      coverImageUrl: null,
      coverAlt: null,
      version: null,
      language: null,
      fileSizeBytes: null,
      cta: 'view',
      routerLink: '/deontologie',
    },
    {
      key: 'referentiel',
      type: 'competency-framework',
      coverImageUrl: null,
      coverAlt: null,
      version: null,
      language: null,
      fileSizeBytes: null,
      cta: 'pending',
    },
    {
      key: 'positions',
      type: 'position-paper',
      coverImageUrl: null,
      coverAlt: null,
      version: null,
      language: null,
      fileSizeBytes: null,
      cta: 'pending',
    },
    {
      key: 'rapports',
      type: 'report',
      coverImageUrl: null,
      coverAlt: null,
      version: null,
      language: null,
      fileSizeBytes: null,
      cta: 'pending',
    },
  ];

  protected readonly livreBlancFileSizeBytes = LIVRE_BLANC_FILE_SIZE_BYTES;

  protected readonly email = signal('');
  protected readonly formStatus = signal<DownloadFormStatus>('idle');
  protected readonly emailTouched = signal(false);

  // Drives `ResourceCarousel`'s `externalPause` input: true while the shared download form's
  // email field has focus, cleared on blur AND forced clear on a successful submission (the
  // "surtout" case from the plan — pausing must not survive a completed send).
  protected readonly emailFieldFocused = signal(false);

  private readonly downloadEmailInput = viewChild<ElementRef<HTMLInputElement>>('downloadEmailInput');

  // Hovering a cover thumbnail shows a large preview overlay of the same image
  // (null when no cover is hovered, hiding the overlay).
  protected readonly previewedCover = signal<CoverKind | null>(null);

  protected previewSrc(kind: CoverKind): string {
    return kind === 'front' ? this.frontCoverSrc : this.backCoverSrc;
  }

  // Same KB/MB formatting `ResourceCarousel.fileSizeLabel` uses for its own vignette — kept as
  // a small local duplicate (rather than exporting/sharing that private method) since the two
  // components don't otherwise share state, and this is the one spot outside the carousel
  // that needs to show the Livre Blanc's file size (next to the download form, per the plan).
  protected formattedLivreBlancFileSize(): string {
    const kb = this.livreBlancFileSizeBytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(0)} ${this.i18n.translate('resourceCarousel.unitKb')}`;
    }
    return `${(kb / 1024).toFixed(1)} ${this.i18n.translate('resourceCarousel.unitMb')}`;
  }

  protected get isEmailInvalid(): boolean {
    return this.emailTouched() && !EMAIL_PATTERN.test(this.email().trim());
  }

  protected onEmailBlur(): void {
    this.emailTouched.set(true);
    this.emailFieldFocused.set(false);
  }

  protected onEmailFocus(): void {
    this.emailFieldFocused.set(true);
  }

  // Called by `ResourceCarousel`'s "recevoir par e-mail" CTA (only rendered on the Livre Blanc
  // vignette today — see `carouselItems`): scrolls to and focuses the shared download form
  // rather than duplicating a second email form per vignette.
  protected focusDownloadForm(): void {
    this.downloadEmailInput()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.downloadEmailInput()?.nativeElement.focus();
  }

  protected submitDownloadForm(): void {
    this.emailTouched.set(true);
    if (this.isEmailInvalid) {
      this.formStatus.set('error');
      return;
    }
    this.formStatus.set('submitting');
    // `submitEmail` never errors on the Observable's error channel (submission failures are
    // mapped to `{ success: false }` — see `LeadCaptureApplicationService`), so a single `next`
    // handler is enough here.
    this.leadCapture.submitEmail(this.email()).subscribe((result) => {
      this.formStatus.set(result.success ? 'success' : 'error');
      if (result.success) {
        // Resume the carousel's autoplay even if the input somehow still has focus.
        this.emailFieldFocused.set(false);
      }
    });
  }
}
