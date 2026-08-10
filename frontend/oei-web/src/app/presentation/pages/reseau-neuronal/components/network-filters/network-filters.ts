import { Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../i18n/i18n.service';
import { Chip } from '../../network-ui.types';

export type NetworkFilterKind = 'country' | 'level' | 'provider';

// Filter toggle + panel (country / OEI level / certification provider chips). Purely
// presentational: chip vocabularies are computed by the page from whatever certifications/
// experts `NetworkCanvas` has loaded so far, so they populate progressively as the user
// explores the graph — documented in `reseau-neuronal.ts`.
@Component({
  selector: 'oei-network-filters',
  templateUrl: './network-filters.html',
  styleUrl: './network-filters.scss',
})
export class NetworkFilters {
  protected readonly i18n = inject(I18nService);

  readonly open = input(false);
  readonly countryChips = input<readonly Chip[]>([]);
  readonly levelChips = input<readonly Chip[]>([]);
  readonly providerChips = input<readonly Chip[]>([]);

  readonly toggleOpen = output<void>();
  readonly chipToggled = output<{ readonly kind: NetworkFilterKind; readonly label: string }>();
  readonly reset = output<void>();

  protected readonly filterCount = computed(
    () =>
      this.countryChips().filter((c) => c.active).length +
      this.levelChips().filter((c) => c.active).length +
      this.providerChips().filter((c) => c.active).length,
  );
}
