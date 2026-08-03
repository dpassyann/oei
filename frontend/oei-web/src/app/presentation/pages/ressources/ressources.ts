import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadCaptureApplicationService } from '../../../application/service/lead-capture-application.service';
import { NgOptimizedImage } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';

interface ResourceLink {
  // `key` is the structural identifier used to build the i18n path
  // `ressources.resourceList.items.<key>.label` — the label itself is never hardcoded here.
  readonly key: string;
  readonly path?: string;
  readonly fragment?: string;
}

type DownloadFormStatus = 'idle' | 'submitting' | 'success' | 'error';
type CoverKind = 'front' | 'back';

@Component({
  selector: 'oei-ressources',
  imports: [FormsModule, RouterLink, NgOptimizedImage],
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

  protected readonly email = signal('');
  protected readonly formStatus = signal<DownloadFormStatus>('idle');

  // Hovering a cover thumbnail shows a large preview overlay of the same image
  // (null when no cover is hovered, hiding the overlay).
  protected readonly previewedCover = signal<CoverKind | null>(null);

  protected previewSrc(kind: CoverKind): string {
    return kind === 'front' ? this.frontCoverSrc : this.backCoverSrc;
  }

  protected async submitDownloadForm(): Promise<void> {
    this.formStatus.set('submitting');
    const result = await this.leadCapture.submitEmail(this.email());
    this.formStatus.set(result.success ? 'success' : 'error');
  }
}
