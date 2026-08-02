import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadCaptureApplicationService } from '../../../application/service/lead-capture-application.service';

interface ResourceLink {
  readonly label: string;
  readonly path?: string;
  readonly fragment?: string;
}

type DownloadFormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'oei-ressources',
  imports: [FormsModule, RouterLink],
  templateUrl: './ressources.html',
  styleUrl: './ressources.scss',
})
export class Ressources {
  private readonly leadCapture = inject(LeadCaptureApplicationService);

  protected readonly frontCoverSrc = '/assets/livre-blanc/couverture-oei.svg';
  protected readonly backCoverSrc = '/assets/livre-blanc/quatrieme-couverture-oei.svg';

  protected readonly resourceLinks: readonly ResourceLink[] = [
    { label: 'Code de déontologie', path: '/deontologie' },
    { label: 'Référentiel de compétences' },
    { label: 'Livre Blanc', fragment: 'livre-blanc' },
    { label: 'Mentions & Positions' },
    { label: 'Rapports & Études' },
  ];

  protected readonly email = signal('');
  protected readonly formStatus = signal<DownloadFormStatus>('idle');

  protected async submitDownloadForm(): Promise<void> {
    this.formStatus.set('submitting');
    const result = await this.leadCapture.submitEmail(this.email());
    this.formStatus.set(result.success ? 'success' : 'error');
  }
}
