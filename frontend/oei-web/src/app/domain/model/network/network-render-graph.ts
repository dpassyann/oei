// Professional Neural Network canvas explorer — render-time view model. Replaces the former
// `network-graph.ts` (single `generateNetworkGraph()` call producing the whole graph in one
// shot): the graph is now loaded progressively through `NetworkGraphPort` (domains → per-domain
// topics/certifications → paginated per-topic experts, see the port's doc comment), and this
// module maps whatever has loaded *so far* into the flat, mutable node/edge structure the canvas
// engine (`network-canvas.ts`, ported almost verbatim from the original monolithic component)
// draws every frame.
//
// `NetworkNode` intentionally stays a single flattened type (domain ∪ topic ∪ certification ∪
// expert fields) rather than a discriminated union of the four domain models: the canvas engine
// (camera projection, hit-testing, per-frame drawing, dossier display) treats all four kinds
// uniformly along shared axes (position, radius, animation phase, label) and only branches on
// `kind` for the handful of kind-specific visuals — splitting it into 4 render types would just
// push the same `switch (n.kind)` logic into more places for no behavioural gain.

import { NetworkDomain } from './network-domain.model';
import { NetworkTopic } from './network-topic.model';
import { NetworkCertification } from './network-certification.model';
import { NetworkExpert } from './network-expert.model';

export type NetworkNodeKind = 'domain' | 'topic' | 'cert' | 'expert';

export type NetworkEdgeKind = 'dd' | 'dt' | 'tt' | 'tc' | 'cc' | 'te';

export interface NetworkNode {
  readonly id: string;
  readonly kind: NetworkNodeKind;
  readonly label: string;
  x: number;
  y: number;
  readonly r: number;
  readonly ph: number;
  // Runtime-only breathing offset, recomputed every animation frame (see `draw()` in
  // `network-canvas.ts`) — mutated in place for performance, never read before first draw.
  _dx: number;
  _dy: number;
  // Domain node only.
  readonly sat?: readonly [number, number, number][];
  // Topic/cert/expert.
  readonly dom?: string;
  // Cert only.
  readonly provider?: string;
  readonly topic?: string;
  readonly prereq?: string;
  readonly desc?: string;
  readonly comps?: readonly string[];
  readonly valid?: string;
  expCount?: number;
  // Expert only.
  readonly role?: string;
  readonly company?: string;
  readonly country?: string;
  readonly level?: 'I' | 'II' | 'III';
  readonly score?: number;
  readonly certs?: readonly string[];
  readonly badges?: readonly string[];
  readonly journey?: readonly string[];
}

export interface NetworkEdge {
  readonly a: string;
  readonly b: string;
  readonly kind: NetworkEdgeKind;
  readonly ph: number;
  readonly sp: number;
}

export interface NetworkStar {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly phase: number;
}

/** Mutable, incrementally-built graph the canvas engine reads every frame. Starts with only
 *  the decorative starfield; domains/topics/certifications/experts get appended to it as
 *  `NetworkGraphPort` responses arrive (see `network-canvas.ts`'s `loadDomains`/
 *  `loadDomainDetail`/`loadExpertsPage`). */
export interface NetworkRenderGraph {
  readonly nodes: NetworkNode[];
  readonly edges: NetworkEdge[];
  readonly byId: Map<string, NetworkNode>;
  readonly adj: Map<string, Set<string>>;
  readonly stars: readonly NetworkStar[];
}

// Small deterministic string hash → [0,1), used to derive purely cosmetic per-node values
// (animation phase, decorative satellite dots) from an id, without needing a shared RNG stream
// across progressively-loaded pages (each page is mapped independently, whenever it arrives).
function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function mkRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addEdge(graph: NetworkRenderGraph, a: string, b: string, kind: NetworkEdgeKind): void {
  if (!graph.byId.has(a) || !graph.byId.has(b)) return;
  graph.edges.push({ a, b, kind, ph: hashUnit(a + b + kind), sp: 0.12 + hashUnit(kind + b + a) * 0.18 });
  if (!graph.adj.has(a)) graph.adj.set(a, new Set());
  if (!graph.adj.has(b)) graph.adj.set(b, new Set());
  graph.adj.get(a)!.add(b);
  graph.adj.get(b)!.add(a);
}

function addNode(graph: NetworkRenderGraph, node: NetworkNode): void {
  if (graph.byId.has(node.id)) return;
  graph.nodes.push(node);
  graph.byId.set(node.id, node);
}

/** Builds an empty render graph with just the decorative starfield (always present, no
 *  network round-trip — purely cosmetic background). */
export function createEmptyRenderGraph(): NetworkRenderGraph {
  const R = mkRng(7);
  const stars: NetworkStar[] = [];
  for (let i = 0; i < 260; i++) {
    stars.push({ x: (R() - 0.5) * 4200, y: (R() - 0.5) * 2800, r: R() * 1.4 + 0.3, phase: R() * 6.28 });
  }
  return { nodes: [], edges: [], byId: new Map(), adj: new Map(), stars };
}

/** Appends the "galaxy" view (`NetworkGraphPort.listDomains()`'s result). */
export function addDomainsToRenderGraph(graph: NetworkRenderGraph, domains: readonly NetworkDomain[]): void {
  for (const d of domains) {
    const R = mkRng(Math.floor(hashUnit(d.id) * 1e6));
    const sat: [number, number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const a = R() * 6.283;
      const r = 18 + R() * 62;
      sat.push([Math.cos(a) * r, Math.sin(a) * r, 1 + R() * 2]);
    }
    addNode(graph, {
      id: d.id,
      kind: 'domain',
      label: d.label,
      x: d.x,
      y: d.y,
      r: 26,
      ph: hashUnit(d.id) * 6,
      _dx: 0,
      _dy: 0,
      sat,
    });
  }
  for (const d of domains) {
    for (const neighborId of d.neighborDomainIds) {
      if (d.id < neighborId) addEdge(graph, d.id, neighborId, 'dd');
    }
  }
}

/** Appends one domain's topics + certifications (`NetworkGraphPort.listTopicsAndCertifications()`'s
 *  result), triggered when the user zooms into that domain. No-op if already loaded (callers
 *  should still guard on their own "loaded domains" set to avoid the redundant request). */
export function addDomainDetailToRenderGraph(
  graph: NetworkRenderGraph,
  domainId: string,
  topics: readonly NetworkTopic[],
  certifications: readonly NetworkCertification[],
): void {
  for (const t of topics) {
    addNode(graph, {
      id: t.id,
      kind: 'topic',
      label: t.label,
      dom: t.domainId,
      x: t.x,
      y: t.y,
      r: 11,
      ph: hashUnit(t.id) * 6,
      _dx: 0,
      _dy: 0,
    });
    addEdge(graph, t.domainId, t.id, 'dt');
    for (const relatedId of t.relatedTopicIds) addEdge(graph, relatedId, t.id, 'tt');
  }
  const labelById = new Map(certifications.map((c) => [c.id, c.label] as const));
  for (const c of certifications) {
    addNode(graph, {
      id: c.id,
      kind: 'cert',
      label: c.label,
      dom: c.domainId,
      topic: c.topicId,
      provider: c.provider,
      prereq: c.prereqCertificationId ? labelById.get(c.prereqCertificationId) ?? 'Aucun prérequis' : 'Aucun prérequis',
      desc: c.description,
      comps: c.validatedSkills,
      valid: c.validityPeriod,
      expCount: c.expertCount,
      x: c.x,
      y: c.y,
      r: 9,
      ph: hashUnit(c.id) * 6,
      _dx: 0,
      _dy: 0,
    });
    addEdge(graph, c.prereqCertificationId ?? c.topicId, c.id, c.prereqCertificationId ? 'cc' : 'tc');
  }
  void domainId; // domain already known from each topic/cert's own domainId field.
}

/** Appends one page of experts for a topic (`NetworkGraphPort.listExperts()`'s result),
 *  triggered when the user zooms to the "experts" level for that topic, then again on
 *  "load more". */
export function addExpertsToRenderGraph(graph: NetworkRenderGraph, topicId: string, experts: readonly NetworkExpert[]): void {
  for (const e of experts) {
    addNode(graph, {
      id: e.id,
      kind: 'expert',
      label: e.label,
      dom: e.domainId,
      topic: e.topicId,
      role: e.role,
      company: e.company,
      country: e.country,
      level: e.level,
      score: e.score,
      certs: e.certificationLabels,
      badges: e.badges,
      journey: e.journeyTopicIds,
      x: e.x,
      y: e.y,
      r: 6.5,
      ph: hashUnit(e.id) * 6,
      _dx: 0,
      _dy: 0,
    });
    addEdge(graph, topicId, e.id, 'te');
  }
}
