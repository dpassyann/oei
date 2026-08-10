import { Component, inject, input } from '@angular/core';
import { I18nService } from '../../../../i18n/i18n.service';

// Brand + breadcrumb corner of the canvas explorer. Purely presentational — the "current
// domain / depth" it displays comes from `NetworkCanvas.crumbChanged`, forwarded by the page.
@Component({
  selector: 'oei-network-breadcrumb',
  templateUrl: './network-breadcrumb.html',
  styleUrl: './network-breadcrumb.scss',
})
export class NetworkBreadcrumb {
  protected readonly i18n = inject(I18nService);

  readonly domainLabel = input<string | null>(null);
  readonly depth = input<0 | 1 | 2>(0);

  protected crumbText(): string {
    const label = this.domainLabel();
    if (!label) return this.i18n.translate('network.crumb.galaxy');
    let text = this.i18n.translate('network.crumb.galaxyPrefix') + ' › ' + label;
    const depth = this.depth();
    if (depth === 2) text += ' › ' + this.i18n.translate('network.crumb.experts');
    else if (depth === 1) text += ' › ' + this.i18n.translate('network.crumb.certifications');
    return text;
  }
}
