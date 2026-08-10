import { Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../i18n/i18n.service';
import { NetworkNode } from '../../../../../domain/model/network/network-render-graph';

// Expert/certification "dossier" side panel. Purely presentational: `node` is the selected
// `NetworkNode` (as loaded by `NetworkCanvas`), `topics` is the already-resolved list of topic
// labels for the expert's "expertise domains" section (resolved by the page, which has access
// to the canvas's node lookup — this component has no port/graph access of its own).
@Component({
  selector: 'oei-network-dossier-panel',
  templateUrl: './network-dossier-panel.html',
  // Split across two files purely to stay under the anyComponentStyle build budget — see
  // `network-dossier-panel-cta.scss`'s doc comment.
  styleUrls: ['./network-dossier-panel.scss', './network-dossier-panel-cta.scss'],
})
export class NetworkDossierPanel {
  protected readonly i18n = inject(I18nService);

  readonly node = input<NetworkNode | null>(null);
  readonly topics = input<readonly string[]>([]);

  readonly close = output<void>();
  readonly openProfile = output<void>();
  readonly startJourney = output<void>();

  protected readonly isExpert = computed(() => this.node()?.kind === 'expert');
  protected readonly isCert = computed(() => this.node()?.kind === 'cert');

  protected readonly expId = computed(() => {
    const n = this.node();
    return n ? 'OEI/EXP-' + n.id.slice(2).padStart(3, '0') : '';
  });
  protected readonly expInitials = computed(
    () =>
      this.node()
        ?.label.split(' ')
        .map((w) => w[0])
        .join('') ?? '',
  );
  protected readonly expScorePct = computed(() => {
    const score = this.node()?.score;
    return score ? Math.round((score - 600) / 4) + '%' : '0%';
  });
}
