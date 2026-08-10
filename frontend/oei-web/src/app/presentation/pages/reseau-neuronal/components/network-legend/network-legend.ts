import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../i18n/i18n.service';

// Static legend (domain/concept/certification/expert markers). No inputs — purely i18n chrome.
@Component({
  selector: 'oei-network-legend',
  templateUrl: './network-legend.html',
  styleUrl: './network-legend.scss',
})
export class NetworkLegend {
  protected readonly i18n = inject(I18nService);
}
