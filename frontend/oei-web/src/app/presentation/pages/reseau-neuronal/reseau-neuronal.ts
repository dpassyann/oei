import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { generateNetworkGraph, NetworkGraph, NetworkNode } from '../../../domain/model/network/network-graph';

// Professional Neural Network — interactive 2D-canvas explorer of the OEI knowledge graph
// (expertise domains → concepts → certifications → member experts). Ported (behavior, colors,
// timings, thresholds) from the pixel-perfect design reference
// (`.prompt/media/r-seau-neuronal-professionnel-oei/project/Reseau Neuronal OEI.dc.html`) into
// this project's Angular 22 style: signals for reactive UI chrome (search, filters, dossier,
// journey, breadcrumb), a single `afterNextRender` to wire up the canvas/pointer/wheel handlers
// and kick off the render loop (same pattern as `hero-globe.ts`), `DestroyRef` for cleanup. The
// camera, hit-testing, and per-frame drawing themselves stay imperative (plain class fields, not
// signals) exactly like the reference — that data changes 60×/s and has no business going through
// change detection.
//
// The graph *data* (domain/topic/cert/expert labels) is intentionally left in French and
// hardcoded, unlike the rest of the UI: it is demonstration content (see `network-graph.ts`),
// not user-facing site copy, and the design reference itself is French-only for it. Only the
// surrounding chrome (buttons, headers, legend, dossier labels…) goes through `I18nService`.

type SelectableKind = 'domain' | 'topic' | 'cert' | 'expert';

interface Camera {
  x: number;
  y: number;
  z: number;
}

interface Hit {
  readonly node: NetworkNode;
  readonly sx: number;
  readonly sy: number;
  readonly sr: number;
}

interface JourneyState {
  readonly steps: readonly string[];
  readonly idx: number;
  readonly name: string;
}

interface SearchResult {
  readonly node: NetworkNode;
  readonly label: string;
  readonly kindLabelKey: string;
  readonly color: string;
  readonly flyZoom: number;
}

interface Chip {
  readonly label: string;
  readonly active: boolean;
}

interface OrbitIcon {
  readonly key: 'profile' | 'linkedin' | 'youtube' | 'contact';
  readonly labelKey: string;
  readonly x: number;
  readonly y: number;
  readonly delay: string;
}

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 15;
const INITIAL_CAMERA: Camera = { x: -60, y: -20, z: 0.52 };
const MINIMAP_BOUNDS = { x: -1250, y: -820, w: 2500, h: 1640 };
const MINIMAP_WIDTH = 380;
const MINIMAP_HEIGHT = 240;

const KIND_ZOOM: Readonly<Record<SelectableKind, number>> = { domain: 1.9, topic: 4.8, cert: 5.2, expert: 8.4 };
const KIND_COLOR: Readonly<Record<SelectableKind, string>> = {
  domain: '#3FA9FF',
  topic: '#3FA9FF',
  cert: '#E8A530',
  expert: '#F7F3EA',
};
const KIND_LABEL_KEY: Readonly<Record<SelectableKind, string>> = {
  domain: 'network.legend.domain',
  topic: 'network.legend.concept',
  cert: 'network.legend.certification',
  expert: 'network.legend.expert',
};

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function lod(z: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (z - a) / (b - a)));
}

@Component({
  selector: 'oei-reseau-neuronal',
  templateUrl: './reseau-neuronal.html',
  styleUrl: './reseau-neuronal.scss',
})
export class ReseauNeuronal {
  protected readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly miniRef = viewChild.required<ElementRef<HTMLCanvasElement>>('minimap');
  private readonly orbitRef = viewChild<ElementRef<HTMLDivElement>>('orbit');

  // ---- Reactive UI chrome state -----------------------------------------------------------
  protected readonly searchQuery = signal('');
  protected readonly filtersOpen = signal(false);
  protected readonly fCountry = signal<readonly string[]>([]);
  protected readonly fLevel = signal<readonly string[]>([]);
  protected readonly fProv = signal<readonly string[]>([]);
  protected readonly selId = signal<string | null>(null);
  protected readonly dossierOpen = signal(false);
  protected readonly journey = signal<JourneyState | null>(null);
  protected readonly crumbState = signal<{ readonly domainLabel: string | null; readonly depth: 0 | 1 | 2 }>({
    domainLabel: null,
    depth: 0,
  });

  // ---- Static graph data (see network-graph.ts for the "why no port/adapter" note) -------
  private readonly graph: NetworkGraph = generateNetworkGraph();

  // ---- Imperative render engine state (plain fields — mutated every frame, no CD needed) --
  private readonly cam: Camera = { ...INITIAL_CAMERA };
  private readonly camT: Camera = { ...INITIAL_CAMERA };
  private hits: Hit[] = [];
  private hover: NetworkNode | null = null;
  private canvasWidth = 800;
  private canvasHeight = 600;
  private dpr = 1;
  private t0 = 0;
  private rafHandle: number | null = null;
  private dead = false;

  protected readonly selNode = computed<NetworkNode | null>(() => {
    const id = this.selId();
    return id ? this.graph.byId.get(id) ?? null : null;
  });
  protected readonly selIsExpert = computed(() => this.selNode()?.kind === 'expert');
  protected readonly selIsCert = computed(() => this.selNode()?.kind === 'cert');
  protected readonly dossierOn = computed(
    () => !!this.selNode() && this.dossierOpen() && (this.selIsExpert() || this.selIsCert()),
  );
  protected readonly hintOn = computed(() => !this.journey());

  protected readonly crumbText = computed(() => {
    const state = this.crumbState();
    if (!state.domainLabel) {
      return this.i18n.translate('network.crumb.galaxy');
    }
    let text = this.i18n.translate('network.crumb.galaxyPrefix') + ' › ' + state.domainLabel;
    if (state.depth === 2) {
      text += ' › ' + this.i18n.translate('network.crumb.experts');
    } else if (state.depth === 1) {
      text += ' › ' + this.i18n.translate('network.crumb.certifications');
    }
    return text;
  });

  protected readonly results = computed<readonly SearchResult[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.graph.nodes
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
  protected readonly hasResults = computed(() => this.results().length > 0);

  protected readonly filterCount = computed(() => this.fCountry().length + this.fLevel().length + this.fProv().length);
  protected readonly countryChips = computed<readonly Chip[]>(() =>
    this.graph.countries.map((c) => ({ label: c, active: this.fCountry().includes(c) })),
  );
  protected readonly levelChips = computed<readonly Chip[]>(() =>
    (['I', 'II', 'III'] as const).map((l) => ({ label: l, active: this.fLevel().includes(l) })),
  );
  protected readonly providerChips = computed<readonly Chip[]>(() =>
    this.graph.providers.map((p) => ({ label: p, active: this.fProv().includes(p) })),
  );

  protected readonly orbitIcons = computed<readonly OrbitIcon[]>(() => {
    const sel = this.selNode();
    if (!sel || sel.kind !== 'expert' || this.dossierOpen() || this.journey()) return [];
    const defs: readonly [OrbitIcon['key'], string][] = [
      ['profile', 'network.orbit.profile'],
      ['linkedin', 'network.orbit.linkedin'],
      ['youtube', 'network.orbit.youtube'],
      ['contact', 'network.orbit.contact'],
    ];
    const radius = 62;
    return defs.map(([key, labelKey], i) => {
      const angle = ((-160 + i * 47) * Math.PI) / 180;
      return {
        key,
        labelKey,
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
        delay: (i * 0.05).toFixed(2) + 's',
      };
    });
  });

  // ---- Expert dossier fields ----------------------------------------------------------------
  protected readonly expId = computed(() => {
    const sel = this.selNode();
    return sel ? 'OEI/EXP-' + sel.id.slice(2).padStart(3, '0') : '';
  });
  protected readonly expInitials = computed(() => this.selNode()?.label.split(' ').map((w) => w[0]).join('') ?? '');
  protected readonly expScorePct = computed(() => {
    const sel = this.selNode();
    return sel?.score ? Math.round((sel.score - 600) / 4) + '%' : '0%';
  });
  protected readonly expTopics = computed<readonly string[]>(() => {
    const sel = this.selNode();
    if (!sel?.journey) return [];
    return [...new Set(sel.journey.slice(-3))].map((id) => this.graph.byId.get(id)?.label ?? '');
  });

  // ---- Journey nav fields --------------------------------------------------------------------
  protected readonly journeyCurrentLabel = computed(() => {
    const j = this.journey();
    if (!j) return '';
    return this.graph.byId.get(j.steps[j.idx])?.label ?? '';
  });

  constructor() {
    afterNextRender(() => this.init());
    this.destroyRef.onDestroy(() => {
      this.dead = true;
      if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------------------------

  private init(): void {
    this.loadFonts();
    const canvas = this.canvasRef().nativeElement;
    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      const d = window.devicePixelRatio || 1;
      canvas.width = Math.max(2, rect.width * d);
      canvas.height = Math.max(2, rect.height * d);
      this.dpr = d;
      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    this.destroyRef.onDestroy(() => resizeObserver.disconnect());

    let down: { x: number; y: number; cx: number; cy: number } | null = null;
    let moved = false;

    const onPointerDown = (ev: PointerEvent): void => {
      down = { x: ev.clientX, y: ev.clientY, cx: this.camT.x, cy: this.camT.y };
      moved = false;
      canvas.setPointerCapture(ev.pointerId);
    };
    const onPointerMove = (ev: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      if (down) {
        const dx = ev.clientX - down.x;
        const dy = ev.clientY - down.y;
        if (Math.hypot(dx, dy) > 4) moved = true;
        if (moved) {
          this.camT.x = down.cx - dx / this.cam.z;
          this.camT.y = down.cy - dy / this.cam.z;
          this.cam.x = this.camT.x;
          this.cam.y = this.camT.y;
        }
      } else {
        this.hover = this.pick(mx, my);
      }
      canvas.style.cursor = down && moved ? 'grabbing' : this.hover ? 'pointer' : 'grab';
    };
    const onPointerUp = (ev: PointerEvent): void => {
      if (down && !moved) {
        const rect = canvas.getBoundingClientRect();
        const n = this.pick(ev.clientX - rect.left, ev.clientY - rect.top);
        if (n) this.onNode(n);
        else if (this.selId()) {
          this.selId.set(null);
          this.dossierOpen.set(false);
        }
      }
      down = null;
    };
    const onWheel = (ev: WheelEvent): void => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left - this.canvasWidth / 2;
      const my = ev.clientY - rect.top - this.canvasHeight / 2;
      const zT = this.camT.z;
      const nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zT * Math.exp(-ev.deltaY * 0.0013)));
      const wx = mx / zT + this.camT.x;
      const wy = my / zT + this.camT.y;
      this.camT.x = wx - mx / nz;
      this.camT.y = wy - my / nz;
      this.camT.z = nz;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    this.destroyRef.onDestroy(() => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    });

    const mini = this.miniRef().nativeElement;
    mini.width = MINIMAP_WIDTH;
    mini.height = MINIMAP_HEIGHT;
    const onMiniClick = (ev: MouseEvent): void => {
      const rect = mini.getBoundingClientRect();
      const s = Math.min(MINIMAP_WIDTH / MINIMAP_BOUNDS.w, MINIMAP_HEIGHT / MINIMAP_BOUNDS.h);
      const wx = ((ev.clientX - rect.left) * 2) / s + MINIMAP_BOUNDS.x;
      const wy = ((ev.clientY - rect.top) * 2) / s + MINIMAP_BOUNDS.y;
      this.camT.x = wx;
      this.camT.y = wy;
      if (this.camT.z < 1) this.camT.z = 1.4;
    };
    mini.addEventListener('click', onMiniClick);
    this.destroyRef.onDestroy(() => mini.removeEventListener('click', onMiniClick));

    this.t0 = performance.now();
    const loop = (now: number): void => {
      if (this.dead) return;
      this.draw(now);
      this.rafHandle = requestAnimationFrame(loop);
    };
    this.rafHandle = requestAnimationFrame(loop);
  }

  // Google Fonts used by the pixel-perfect reference ('Space Grotesk' for headings/canvas
  // labels, 'Instrument Sans' for body text) aren't loaded elsewhere on the site, so this page
  // loads them itself — guarded so navigating here twice in the same session doesn't duplicate
  // the <link> tags.
  private loadFonts(): void {
    if (document.getElementById('oei-network-fonts')) return;
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    const stylesheet = document.createElement('link');
    stylesheet.id = 'oei-network-fonts';
    stylesheet.rel = 'stylesheet';
    stylesheet.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap';
    document.head.append(preconnect, stylesheet);
  }

  // ---------------------------------------------------------------------------------------------
  // Interaction handlers bound from the template
  // ---------------------------------------------------------------------------------------------

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  protected pickResult(result: SearchResult): void {
    const n = result.node;
    this.flyTo(n.x, n.y, KIND_ZOOM[n.kind as SelectableKind]);
    this.searchQuery.set('');
    if (n.kind === 'cert' || n.kind === 'expert') {
      this.selId.set(n.id);
      this.dossierOpen.set(n.kind === 'cert');
    } else {
      this.selId.set(null);
      this.dossierOpen.set(false);
    }
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  protected toggleChip(kind: 'country' | 'level' | 'provider', label: string): void {
    const signalRef = kind === 'country' ? this.fCountry : kind === 'level' ? this.fLevel : this.fProv;
    signalRef.update((arr) => (arr.includes(label) ? arr.filter((x) => x !== label) : [...arr, label]));
  }

  protected resetFilters(): void {
    this.fCountry.set([]);
    this.fLevel.set([]);
    this.fProv.set([]);
  }

  protected closePanel(): void {
    if (this.selNode()?.kind === 'expert') {
      this.dossierOpen.set(false);
    } else {
      this.selId.set(null);
      this.dossierOpen.set(false);
    }
  }

  protected openExpertProfile(): void {
    this.dossierOpen.set(true);
  }

  protected startJourney(): void {
    const sel = this.selNode();
    if (!sel?.journey) return;
    const steps = sel.journey;
    this.journey.set({ steps, idx: 0, name: sel.label });
    const n = this.graph.byId.get(steps[0]);
    if (n) this.flyTo(n.x, n.y, 3.4);
  }

  protected journeyGo(idx: number): void {
    const j = this.journey();
    if (!j) return;
    const i = Math.min(j.steps.length - 1, Math.max(0, idx));
    this.journey.set({ ...j, idx: i });
    const n = this.graph.byId.get(j.steps[i]);
    if (n) this.flyTo(n.x, n.y, 3.4);
  }

  protected journeyClose(): void {
    this.journey.set(null);
  }

  protected zoomIn(): void {
    this.camT.z = Math.min(ZOOM_MAX, this.camT.z * 1.5);
  }

  protected zoomOut(): void {
    this.camT.z = Math.max(ZOOM_MIN, this.camT.z * 0.66);
  }

  protected zoomReset(): void {
    this.camT.x = INITIAL_CAMERA.x;
    this.camT.y = INITIAL_CAMERA.y;
    this.camT.z = INITIAL_CAMERA.z;
  }

  // ---------------------------------------------------------------------------------------------
  // Engine
  // ---------------------------------------------------------------------------------------------

  private flyTo(x: number, y: number, z: number): void {
    this.camT.x = x;
    this.camT.y = y;
    this.camT.z = z;
  }

  private pick(mx: number, my: number): NetworkNode | null {
    let best: NetworkNode | null = null;
    let bd = 1e9;
    for (const h of this.hits) {
      const d = Math.hypot(h.sx - mx, h.sy - my);
      if (d < Math.max(h.sr + 6, 12) && d < bd) {
        bd = d;
        best = h.node;
      }
    }
    return best;
  }

  private onNode(n: NetworkNode): void {
    if (n.kind === 'domain') {
      this.flyTo(n.x, n.y, 2.3);
    } else if (n.kind === 'topic') {
      this.flyTo(n.x, n.y, Math.max(4.6, this.camT.z));
    } else if (n.kind === 'cert') {
      this.selId.set(n.id);
      this.dossierOpen.set(true);
      this.journey.set(null);
      this.flyTo(n.x + 25, n.y, 5.2);
    } else {
      this.selId.set(n.id);
      this.dossierOpen.set(false);
      this.journey.set(null);
      this.flyTo(n.x + 10, n.y, 8.4);
    }
  }

  private draw(now: number): void {
    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (!ctx) return;
    const t = (now - this.t0) / 1000;
    const cam = this.cam;
    const camT = this.camT;
    cam.x = lerp(cam.x, camT.x, 0.09);
    cam.y = lerp(cam.y, camT.y, 0.09);
    cam.z = lerp(cam.z, camT.z, 0.09);
    const z = cam.z;
    const W = this.canvasWidth || 800;
    const H = this.canvasHeight || 600;
    const px = (wx: number): number => (wx - cam.x) * z + W / 2;
    const py = (wy: number): number => (wy - cam.y) * z + H / 2;

    ctx.setTransform(this.dpr || 1, 0, 0, this.dpr || 1, 0, 0);
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    bg.addColorStop(0, '#0a1a34');
    bg.addColorStop(1, '#071224');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (const star of this.graph.stars) {
      const x = (star.x - cam.x * 0.25) * Math.max(z * 0.4, 0.3) + W / 2;
      const y = (star.y - cam.y * 0.25) * Math.max(z * 0.4, 0.3) + H / 2;
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      ctx.globalAlpha = 0.15 + 0.15 * Math.sin(t * 0.7 + star.phase);
      ctx.fillStyle = '#9fc9ef';
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const aT = lod(z, 1.3, 2.3);
    const aC = lod(z, 2.2, 3.6);
    const aE = lod(z, 4, 6.2);
    for (const n of this.graph.nodes) {
      if (n.kind === 'domain') {
        n._dx = 0;
        n._dy = 0;
      } else {
        n._dx = 2.6 * Math.sin(t * 0.33 + n.ph * 1.9);
        n._dy = 2.2 * Math.cos(t * 0.29 + n.ph * 1.3);
      }
    }

    const fCountry = this.fCountry();
    const fLevel = this.fLevel();
    const fProv = this.fProv();
    const sel = this.selId();
    const journey = this.journey();
    const dim = (n: NetworkNode): boolean => {
      if (n.kind === 'expert') {
        return (
          (fCountry.length > 0 && !fCountry.includes(n.country ?? '')) ||
          (fLevel.length > 0 && !fLevel.includes(n.level ?? ''))
        );
      }
      if (n.kind === 'cert') return fProv.length > 0 && !fProv.includes(n.provider ?? '');
      return false;
    };
    const hov = this.hover;
    const adj = this.graph.adj;
    const near = (id: string): boolean => !!hov && (hov.id === id || (adj.get(hov.id)?.has(id) ?? false));

    for (const e of this.graph.edges) {
      let a = 0;
      let col = '63,169,255';
      let w = 1;
      if (e.kind === 'dd') {
        a = 0.16 * (1 - lod(z, 2.5, 6) * 0.75);
        w = 1.4;
      } else if (e.kind === 'dt') {
        a = 0.22 * aT;
      } else if (e.kind === 'tt') {
        a = 0.26 * aT;
      } else if (e.kind === 'tc') {
        a = 0.35 * aC;
        col = '232,165,48';
      } else if (e.kind === 'cc') {
        a = 0.45 * aC;
        col = '232,165,48';
      } else if (e.kind === 'te') {
        a = 0.22 * aE;
        col = '200,215,235';
        w = 0.8;
      }
      if (a <= 0.01) continue;
      const A = this.graph.byId.get(e.a)!;
      const B = this.graph.byId.get(e.b)!;
      if (near(A.id) && near(B.id)) {
        a = Math.min(0.95, a * 3 + 0.35);
        w += 0.8;
      }
      if (dim(A) || dim(B)) a *= 0.15;
      const x1 = px(A.x + A._dx);
      const y1 = py(A.y + A._dy);
      const x2 = px(B.x + B._dx);
      const y2 = py(B.y + B._dy);
      if (Math.max(x1, x2) < -60 || Math.min(x1, x2) > W + 60 || Math.max(y1, y2) < -60 || Math.min(y1, y2) > H + 60)
        continue;
      const bw = e.ph > 0.5 ? 0.13 : -0.13;
      const mx = (x1 + x2) / 2 - (y2 - y1) * bw;
      const my = (y1 + y2) / 2 + (x2 - x1) * bw;
      ctx.strokeStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.stroke();
      if (a > 0.05) {
        const p = (t * e.sp + e.ph) % 1;
        const q = 1 - p;
        const bx = q * q * x1 + 2 * q * p * mx + p * p * x2;
        const by = q * q * y1 + 2 * q * p * my + p * p * y2;
        ctx.fillStyle = 'rgba(' + col + ',' + Math.min(0.9, a * 3) + ')';
        ctx.beginPath();
        ctx.arc(bx, by, 1.6, 0, 6.283);
        ctx.fill();
      }
    }

    if (journey) {
      const steps = journey.steps.map((id) => this.graph.byId.get(id)!);
      ctx.strokeStyle = 'rgba(232,165,48,.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 7]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      steps.forEach((n, i) => {
        const x = px(n.x + n._dx);
        const y = py(n.y + n._dy);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      steps.forEach((n, i) => {
        const x = px(n.x + n._dx);
        const y = py(n.y + n._dy);
        ctx.fillStyle = i <= journey.idx ? '#E8A530' : 'rgba(232,165,48,.35)';
        ctx.beginPath();
        ctx.arc(x, y, i === journey.idx ? 7 : 4.5, 0, 6.283);
        ctx.fill();
        if (i === journey.idx) {
          ctx.strokeStyle = 'rgba(232,165,48,.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, 12 + 2 * Math.sin(t * 3), 0, 6.283);
          ctx.stroke();
        }
      });
    }

    this.hits = [];
    const hit = (n: NetworkNode, sx: number, sy: number, sr: number, al: number): void => {
      if (al > 0.25) this.hits.push({ node: n, sx, sy, sr });
    };

    for (const n of this.graph.nodes) {
      const x = px(n.x + n._dx);
      const y = py(n.y + n._dy);
      if (x < -160 || x > W + 160 || y < -160 || y > H + 160) continue;
      const breath = 1 + 0.06 * Math.sin(t * 0.9 + n.ph);
      const isSel = sel === n.id;
      const isHov = !!hov && hov.id === n.id;
      const isNear = near(n.id);
      const dm = dim(n) ? 0.18 : 1;

      if (n.kind === 'domain') {
        const gr = 90 * z * breath;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, gr);
        gg.addColorStop(0, 'rgba(63,169,255,' + 0.4 * dm + ')');
        gg.addColorStop(0.4, 'rgba(63,169,255,' + 0.12 * dm + ')');
        gg.addColorStop(1, 'rgba(63,169,255,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(x, y, gr, 0, 6.283);
        ctx.fill();
        const satA = (1 - aT) * 0.9 * dm;
        if (satA > 0.02 && n.sat) {
          ctx.fillStyle = 'rgba(159,201,239,' + satA + ')';
          for (const [ox, oy, or_] of n.sat) {
            ctx.beginPath();
            ctx.arc(x + ox * z, y + oy * z, Math.max(0.8, or_ * z * 0.6), 0, 6.283);
            ctx.fill();
          }
        }
        ctx.fillStyle = 'rgba(212,233,255,' + dm + ')';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(5, 10 * z) * breath, 0, 6.283);
        ctx.fill();
        if (isHov || isSel) {
          ctx.strokeStyle = '#E8A530';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(5, 10 * z) * breath + 6, 0, 6.283);
          ctx.stroke();
        }
        const la = Math.max(0.25, 1 - aT * 0.75) * dm;
        ctx.fillStyle = 'rgba(247,243,234,' + la + ')';
        ctx.font = '700 ' + Math.min(38, Math.max(13, 26 * z)) + 'px "Space Grotesk",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, x, y - Math.max(14, 16 * z) - 10);
        hit(n, x, y, Math.max(20, 20 * z), 1);
      } else if (n.kind === 'topic') {
        if (aT <= 0.02) continue;
        const al = aT * dm;
        const rr = Math.max(3.5, n.r * z * 0.55) * breath;
        ctx.globalAlpha = al;
        ctx.fillStyle = '#0d2242';
        ctx.strokeStyle = isNear || isHov || isSel ? '#E8A530' : '#3FA9FF';
        ctx.lineWidth = isHov || isSel ? 2 : 1.4;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, 6.283);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = isNear || isHov ? '#E8A530' : '#3FA9FF';
        ctx.beginPath();
        ctx.arc(x, y, rr * 0.4, 0, 6.283);
        ctx.fill();
        if (aT > 0.3) {
          ctx.fillStyle = 'rgba(247,243,234,' + 0.85 * al + ')';
          ctx.font = '500 ' + Math.min(17, Math.max(10, 4.6 * z)) + 'px "Instrument Sans",sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, x, y + rr + Math.min(16, Math.max(11, 4.4 * z)));
        }
        ctx.globalAlpha = 1;
        hit(n, x, y, rr, al);
      } else if (n.kind === 'cert') {
        if (aC <= 0.02) continue;
        const al = aC * dm;
        const rr = Math.max(4, n.r * z * 0.6) * breath;
        ctx.globalAlpha = al;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, rr * 2.6);
        gg.addColorStop(0, 'rgba(232,165,48,' + (0.4 + 0.22 * Math.sin(t * 2.2 + n.ph)).toFixed(3) + ')');
        gg.addColorStop(1, 'rgba(232,165,48,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(x, y, rr * 2.6, 0, 6.283);
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a2 = (i * Math.PI) / 3 - Math.PI / 6;
          const hx = x + Math.cos(a2) * rr;
          const hy = y + Math.sin(a2) * rr;
          if (i) ctx.lineTo(hx, hy);
          else ctx.moveTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = isSel || isHov ? '#f0b649' : '#E8A530';
        ctx.fill();
        if (isSel) {
          ctx.strokeStyle = '#F7F3EA';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        if (aC > 0.5) {
          ctx.fillStyle = 'rgba(247,243,234,' + 0.85 * al + ')';
          ctx.font = '500 ' + Math.min(14, Math.max(9, 2.6 * z)) + 'px "Instrument Sans",sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, x, y + rr + Math.min(14, Math.max(10, 2.4 * z)));
        }
        ctx.globalAlpha = 1;
        hit(n, x, y, rr + 3, al);
      } else {
        if (aE <= 0.02) continue;
        const al = aE * dm;
        const rr = Math.max(3, n.r * z * 0.7) * breath;
        ctx.globalAlpha = al;
        ctx.fillStyle = '#0d2242';
        ctx.strokeStyle = isSel || isHov ? '#E8A530' : 'rgba(247,243,234,.85)';
        ctx.lineWidth = isSel ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, 6.283);
        ctx.fill();
        ctx.stroke();
        if (z > 6.5) {
          ctx.fillStyle = '#F7F3EA';
          ctx.font = '600 ' + Math.max(7, rr * 0.75) + 'px "Space Grotesk",sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            n.label.split(' ').map((w) => w[0]).join(''),
            x,
            y + 0.5,
          );
          ctx.textBaseline = 'alphabetic';
        } else {
          ctx.fillStyle = 'rgba(247,243,234,.9)';
          ctx.beginPath();
          ctx.arc(x, y, rr * 0.35, 0, 6.283);
          ctx.fill();
        }
        if (aE > 0.55) {
          ctx.fillStyle = 'rgba(247,243,234,' + 0.8 * al + ')';
          ctx.font = '400 ' + Math.min(13, Math.max(9, 1.7 * z)) + 'px "Instrument Sans",sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, x, y + rr + Math.min(13, Math.max(9, 1.6 * z)));
        }
        ctx.globalAlpha = 1;
        hit(n, x, y, rr + 3, al);
      }
    }

    const orbitEl = this.orbitRef()?.nativeElement;
    if (orbitEl) {
      const sn = sel ? this.graph.byId.get(sel) ?? null : null;
      if (sn && sn.kind === 'expert' && !this.dossierOpen() && !journey) {
        orbitEl.style.display = 'block';
        orbitEl.style.left = px(sn.x + sn._dx) + 'px';
        orbitEl.style.top = py(sn.y + sn._dy) + 'px';
      } else {
        orbitEl.style.display = 'none';
      }
    }

    let domainLabel: string | null = null;
    let depth: 0 | 1 | 2 = 0;
    if (z >= 1.5) {
      let best: NetworkNode | null = null;
      let bd = 1e9;
      for (const n of this.graph.nodes) {
        if (n.kind !== 'domain') continue;
        const d = Math.hypot(n.x - cam.x, n.y - cam.y);
        if (d < bd) {
          bd = d;
          best = n;
        }
      }
      if (best && bd < 600) {
        domainLabel = best.label;
        depth = z >= 6 ? 2 : z >= 3.6 ? 1 : 0;
      }
    }
    const prevCrumb = this.crumbState();
    if (prevCrumb.domainLabel !== domainLabel || prevCrumb.depth !== depth) {
      this.crumbState.set({ domainLabel, depth });
    }

    this.drawMinimap(W, H, z, cam);
  }

  private drawMinimap(W: number, H: number, z: number, cam: Camera): void {
    const m = this.miniRef().nativeElement.getContext('2d');
    if (!m) return;
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    m.fillStyle = 'rgba(7,18,36,.5)';
    m.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    const b = MINIMAP_BOUNDS;
    const s = Math.min(MINIMAP_WIDTH / b.w, MINIMAP_HEIGHT / b.h);
    for (const n of this.graph.nodes) {
      if (n.kind !== 'domain') continue;
      const x = (n.x - b.x) * s;
      const y = (n.y - b.y) * s;
      const gg = m.createRadialGradient(x, y, 0, x, y, 14);
      gg.addColorStop(0, 'rgba(63,169,255,.7)');
      gg.addColorStop(1, 'rgba(63,169,255,0)');
      m.fillStyle = gg;
      m.beginPath();
      m.arc(x, y, 14, 0, 6.283);
      m.fill();
      m.fillStyle = '#cfe6ff';
      m.beginPath();
      m.arc(x, y, 2, 0, 6.283);
      m.fill();
    }
    const vw = (W / z) * s;
    const vh = (H / z) * s;
    const vx = (cam.x - b.x) * s - vw / 2;
    const vy = (cam.y - b.y) * s - vh / 2;
    m.strokeStyle = '#E8A530';
    m.lineWidth = 1.5;
    m.strokeRect(Math.max(1, vx), Math.max(1, vy), Math.min(MINIMAP_WIDTH - 2, vw), Math.min(MINIMAP_HEIGHT - 2, vh));
  }
}
