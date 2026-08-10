import { Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../i18n/i18n.service';
import { SearchResult } from '../../network-ui.types';

// Search input + result dropdown for the canvas explorer. Purely presentational: the page owns
// the query string and computes `results` from whatever nodes `NetworkCanvas` has loaded so
// far (search is scoped to already-loaded data — see `reseau-neuronal.ts`'s doc comment).
@Component({
  selector: 'oei-network-search-bar',
  templateUrl: './network-search-bar.html',
  styleUrl: './network-search-bar.scss',
})
export class NetworkSearchBar {
  protected readonly i18n = inject(I18nService);

  readonly query = input('');
  readonly results = input<readonly SearchResult[]>([]);

  readonly queryChange = output<string>();
  readonly resultPicked = output<SearchResult>();

  protected readonly hasResults = computed(() => this.results().length > 0);

  protected onInput(value: string): void {
    this.queryChange.emit(value);
  }
}
