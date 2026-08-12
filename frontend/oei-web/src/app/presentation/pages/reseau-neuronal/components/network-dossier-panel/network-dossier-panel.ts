import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { I18nService } from '../../../../i18n/i18n.service';
import { NetworkNode, NetworkNodeKind } from '../../../../../domain/model/network/network-render-graph';
import { NETWORK_GRAPH_PORT } from '../../../../../domain/port/network/network-graph.port';
import {
  NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES,
  NetworkSalaryNodeType,
} from '../../../../../domain/model/network/network-salary-insight.model';

// Maps a `NetworkNode`'s render-graph `kind` onto the salary insight feature's node-type
// vocabulary (`NetworkSalaryNodeType` excludes `'expert'` — an individual member is never the
// subject of an anonymized aggregate, see `CurrentCompensation`'s doc comment).
const SALARY_NODE_TYPE_BY_KIND: Readonly<Partial<Record<NetworkNodeKind, NetworkSalaryNodeType>>> = {
  domain: 'domain',
  topic: 'topic',
  cert: 'certification',
};

// Expert/certification/domain/topic "dossier" side panel. Mostly presentational: `node` is the
// selected `NetworkNode` (as loaded by `NetworkCanvas`), `topics` is the already-resolved list
// of topic labels for the expert's "expertise domains" section (resolved by the page, which has
// access to the canvas's node lookup — this component still has no port access for anything
// expert-related). The one exception is the anonymized salary insight section below: it injects
// `NetworkGraphPort` directly and queries it itself, the same pattern `NetworkCanvas` already
// uses elsewhere on this page, since there is no page-level state to route it through (unlike
// `topics`, which the page already computes for the expert case from data it has anyway).
@Component({
  selector: 'oei-network-dossier-panel',
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './network-dossier-panel.html',
  // Split across two files purely to stay under the anyComponentStyle build budget — see
  // `network-dossier-panel-cta.scss`'s doc comment.
  styleUrls: ['./network-dossier-panel.scss', './network-dossier-panel-cta.scss', './network-dossier-panel-salary.scss'],
})
export class NetworkDossierPanel {
  protected readonly i18n = inject(I18nService);
  private readonly networkGraphPort = inject(NETWORK_GRAPH_PORT);

  readonly node = input<NetworkNode | null>(null);
  readonly topics = input<readonly string[]>([]);

  readonly close = output<void>();
  readonly openProfile = output<void>();
  readonly startJourney = output<void>();

  protected readonly isExpert = computed(() => this.node()?.kind === 'expert');
  protected readonly isCert = computed(() => this.node()?.kind === 'cert');
  protected readonly isDomain = computed(() => this.node()?.kind === 'domain');
  protected readonly isTopic = computed(() => this.node()?.kind === 'topic');

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

  // ---- Anonymized salary transparency (domain/topic/certification nodes only) ----------------
  protected readonly salaryNodeType = computed<NetworkSalaryNodeType | undefined>(() => {
    const kind = this.node()?.kind;
    return kind ? SALARY_NODE_TYPE_BY_KIND[kind] : undefined;
  });
  protected readonly salaryCountryOptions = NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES;
  protected readonly selectedCountry = signal<string | undefined>(undefined);

  private readonly salaryInsightResource = rxResource({
    params: () => {
      const nodeType = this.salaryNodeType();
      const nodeId = this.node()?.id;
      return nodeType && nodeId ? { nodeType, nodeId, country: this.selectedCountry() } : undefined;
    },
    stream: ({ params }) => this.networkGraphPort.getSalaryInsight(params.nodeType, params.nodeId, params.country),
  });
  protected readonly salaryInsight = computed(() => this.salaryInsightResource.value());

  constructor() {
    // Reset the country filter whenever the selected node changes, so switching from one
    // node to another never keeps a stale "France" (say) selection silently applied.
    effect(() => {
      this.node();
      this.selectedCountry.set(undefined);
    });
  }

  protected onSalaryCountryChange(value: string): void {
    this.selectedCountry.set(value || undefined);
  }
}
