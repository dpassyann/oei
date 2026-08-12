import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { NetworkCanvas } from './components/network-canvas/network-canvas';
import { NetworkSearchBar } from './components/network-search-bar/network-search-bar';
import { NetworkFilters, NetworkFilterKind } from './components/network-filters/network-filters';
import { NetworkDossierPanel } from './components/network-dossier-panel/network-dossier-panel';
import { NetworkJourneyBar } from './components/network-journey-bar/network-journey-bar';
import { NetworkBreadcrumb } from './components/network-breadcrumb/network-breadcrumb';
import { NetworkLegend } from './components/network-legend/network-legend';
import { Chip, JourneyState, KIND_COLOR, KIND_LABEL_KEY, KIND_ZOOM, SearchResult, SelectableKind } from './network-ui.types';

// Professional Neural Network — interactive 2D-canvas explorer of the OEI knowledge graph
// (expertise domains → topics → certifications → member experts). Ported (behavior, colors,
// timings, thresholds) from the pixel-perfect design reference
// (`.prompt/media/r-seau-neuronal-professionnel-oei/project/Reseau Neuronal OEI.dc.html`).
//
// This page is now a thin orchestrator: the canvas rendering/camera/pick engine and the
// progressive loading against `NetworkGraphPort` live in `NetworkCanvas` (see that component's
// doc comment), and each piece of UI chrome (search, filters, dossier, journey bar, breadcrumb,
// legend) is its own small input/output-driven component under `components/`. This page only
// holds the UI-chrome state that doesn't belong to any single sub-component (search query,
// filters-panel open/closed, active filter values, journey, breadcrumb text, fullscreen) and
// wires them together — reading from `NetworkCanvas`'s public signals/methods via `viewChild`.
//
// Header/footer integration: unlike the original implementation (a `position: fixed; inset: 0`
// full-viewport takeover that sat *above* `<oei-site-header>`/`<oei-site-footer>`, visually
// hiding them while the route was active), this page renders in the normal document flow by
// default — the header stays visible above it and the footer remains reachable by scrolling
// past it, so a visitor never feels "trapped" outside the rest of the site. A "Plein écran"
// toggle is kept for visitors who want the original immersive experience; entering it switches
// the stage to a `position: fixed` overlay (same visual takeover as before) but always shows an
// explicit "Quitter le plein écran" button (and responds to Escape) so leaving it is never more
// than one obvious action away.
//
// Search intentionally only looks through nodes `NetworkCanvas` has already loaded (domains
// always, topics/certifications once a domain's been zoomed into, experts once a topic's been
// opened) — see `NetworkGraphPort`'s doc comment on why the graph loads progressively instead of
// all at once. A global full-text search across not-yet-loaded experts would need a dedicated
// backend search endpoint and is out of scope here.
//
// The graph *data* (domain/topic/cert/expert labels) is intentionally left in French and
// hardcoded in the mock adapter, unlike the rest of the UI: it is demonstration content (see
// `network-graph-mock.adapter.ts`), not user-facing site copy, and the design reference itself
// is French-only for it. Only the surrounding chrome (buttons, headers, legend, dossier
// labels…) goes through `I18nService`.
@Component({
  selector: 'oei-reseau-neuronal',
  imports: [NetworkCanvas, NetworkSearchBar, NetworkFilters, NetworkDossierPanel, NetworkJourneyBar, NetworkBreadcrumb, NetworkLegend],
  templateUrl: './reseau-neuronal.html',
  styleUrl: './reseau-neuronal.scss',
})
export class ReseauNeuronal {
  protected readonly i18n = inject(I18nService);

  private readonly canvas = viewChild(NetworkCanvas);

  // ---- UI-chrome state not owned by any single sub-component ------------------------------
  protected readonly searchQuery = signal('');
  protected readonly filtersOpen = signal(false);
  protected readonly fCountry = signal<readonly string[]>([]);
  protected readonly fLevel = signal<readonly string[]>([]);
  protected readonly fProv = signal<readonly string[]>([]);
  protected readonly journey = signal<JourneyState | null>(null);
  protected readonly crumb = signal<{ readonly domainLabel: string | null; readonly depth: 0 | 1 | 2 }>({
    domainLabel: null,
    depth: 0,
  });
  protected readonly fullscreen = signal(false);

  protected readonly hintOn = computed(() => !this.journey());

  // ---- Derived from the canvas's progressively-loaded graph (re-evaluated whenever
  // `graphVersion()` bumps — see `NetworkCanvas` doc comment) --------------------------------
  private readonly allNodes = computed(() => {
    const c = this.canvas();
    if (!c) return [];
    c.graphVersion();
    return c.getAllNodes();
  });

  protected readonly selNode = computed(() => {
    const c = this.canvas();
    const id = c?.selId() ?? null;
    return id ? c!.getNode(id) : null;
  });
  protected readonly dossierOn = computed(() => {
    const c = this.canvas();
    const n = this.selNode();
    // All four node kinds can now open the dossier panel — domain/topic/certification also
    // carry the anonymized salary insight section (see `NetworkGraphPort.getSalaryInsight`),
    // not just certification as before.
    return !!n && !!c?.dossierOpen();
  });

  protected readonly expTopics = computed<readonly string[]>(() => {
    const n = this.selNode();
    const c = this.canvas();
    if (!n?.journey || !c) return [];
    return [...new Set(n.journey.slice(-3))].map((id) => c.getNode(id)?.label ?? '');
  });

  protected readonly journeyCurrentLabel = computed(() => {
    const j = this.journey();
    const c = this.canvas();
    if (!j || !c) return '';
    return c.getNode(j.steps[j.idx])?.label ?? '';
  });

  protected readonly results = computed<readonly SearchResult[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.allNodes()
      .filter((n) => n.label.toLowerCase().includes(q))
      .slice(0, 8)
      .map((n) => ({
        node: n,
        label: n.label,
        kindLabelKey: KIND_LABEL_KEY[n.kind as SelectableKind],
        color: KIND_COLOR[n.kind as SelectableKind],
        flyZoom: KIND_ZOOM[n.kind as SelectableKind],
      }));
  });

  // Filter vocabularies populate progressively as the corresponding data loads (certifications
  // for providers, experts for countries) — a domain not explored yet simply doesn't contribute
  // any chips yet, consistent with the zoom-driven progressive loading of the whole page.
  protected readonly countryChips = computed<readonly Chip[]>(() => {
    const countries = new Set<string>();
    for (const n of this.allNodes()) if (n.kind === 'expert' && n.country) countries.add(n.country);
    return [...countries].sort().map((c) => ({ label: c, active: this.fCountry().includes(c) }));
  });
  protected readonly levelChips = computed<readonly Chip[]>(() =>
    (['I', 'II', 'III'] as const).map((l) => ({ label: l, active: this.fLevel().includes(l) })),
  );
  protected readonly providerChips = computed<readonly Chip[]>(() => {
    const providers = new Set<string>();
    for (const n of this.allNodes()) if (n.kind === 'cert' && n.provider) providers.add(n.provider);
    return [...providers].sort().map((p) => ({ label: p, active: this.fProv().includes(p) }));
  });

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  protected pickResult(result: SearchResult): void {
    this.canvas()?.selectFromSearch(result.node.id);
    this.searchQuery.set('');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  protected toggleChip(evt: { readonly kind: NetworkFilterKind; readonly label: string }): void {
    const signalRef = evt.kind === 'country' ? this.fCountry : evt.kind === 'level' ? this.fLevel : this.fProv;
    signalRef.update((arr) => (arr.includes(evt.label) ? arr.filter((x) => x !== evt.label) : [...arr, evt.label]));
  }

  protected resetFilters(): void {
    this.fCountry.set([]);
    this.fLevel.set([]);
    this.fProv.set([]);
  }

  protected closePanel(): void {
    this.canvas()?.closeDossier();
  }

  protected openExpertProfile(): void {
    this.canvas()?.openExpertProfile();
  }

  protected startJourney(): void {
    const n = this.selNode();
    if (!n?.journey) return;
    const steps = n.journey;
    this.journey.set({ steps, idx: 0, name: n.label });
    this.canvas()?.flyToNode(steps[0], 3.4);
  }

  protected journeyGo(delta: number): void {
    const j = this.journey();
    if (!j) return;
    const i = Math.min(j.steps.length - 1, Math.max(0, j.idx + delta));
    this.journey.set({ ...j, idx: i });
    this.canvas()?.flyToNode(j.steps[i], 3.4);
  }

  protected journeyClose(): void {
    this.journey.set(null);
  }

  protected onCrumbChanged(evt: { readonly domainLabel: string | null; readonly depth: 0 | 1 | 2 }): void {
    this.crumb.set(evt);
  }

  protected toggleFullscreen(): void {
    this.fullscreen.update((v) => !v);
  }

  protected onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.fullscreen()) this.fullscreen.set(false);
  }
}
