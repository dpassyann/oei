import { Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../i18n/i18n.service';
import { JourneyState } from '../../network-ui.types';

// Journey navigation bar (prev/next through an expert's suggested learning path). Purely
// presentational — `currentLabel` (the current step's topic label) is resolved by the page via
// `NetworkCanvas.getNode()`, since this component has no graph access of its own.
@Component({
  selector: 'oei-network-journey-bar',
  templateUrl: './network-journey-bar.html',
  styleUrl: './network-journey-bar.scss',
})
export class NetworkJourneyBar {
  protected readonly i18n = inject(I18nService);

  readonly journey = input.required<JourneyState>();
  readonly currentLabel = input('');

  readonly prev = output<void>();
  readonly next = output<void>();
  readonly close = output<void>();
}
