// Professional Neural Network graph (task: .prompt/plan/final/01-CERTIFICATIONS-AND-NEURAL-NETWORK-INTEGRATION.md).
//
// IMPORTANT — this is demonstration data, not a domain port/adapter pair. The 9 OEI expertise
// domains, their satellite concepts, the 10 real-world certifications and the 52 fictitious
// member experts below are reproduced exactly (same labels, same coordinates, same seeded
// pseudo-random generation) from the pixel-perfect design reference
// (`.prompt/media/r-seau-neuronal-professionnel-oei/project/Reseau Neuronal OEI.dc.html`). There
// is intentionally no `NETWORK_GRAPH_PORT` / mock+api adapter pair yet: this dataset is a fixed,
// self-contained demo, not something fetched from a backend. As real OEI member profiles and
// certifications get onboarded, this module is meant to be replaced (or grown into a proper
// port/adapter) so the canvas explorer renders real data instead of the seeded demo graph.

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
  // Runtime-only breathing offset, recomputed every animation frame (see `draw()` in the
  // network canvas component) — mutated in place for performance, never read before first draw.
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

export interface NetworkGraph {
  readonly nodes: readonly NetworkNode[];
  readonly edges: readonly NetworkEdge[];
  readonly byId: ReadonlyMap<string, NetworkNode>;
  readonly adj: ReadonlyMap<string, ReadonlySet<string>>;
  readonly countries: readonly string[];
  readonly providers: readonly string[];
  readonly stars: readonly NetworkStar[];
}

// Deterministic seeded PRNG (sfc32-ish mix) — ported bit-for-bit from the reference's `mkRng` so
// the generated graph is byte-identical run to run (and identical to the design reference).
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

const DOMS: readonly [string, string, number, number][] = [
  ['ia', 'Intelligence Artificielle', -80, -520],
  ['cyber', 'Cybersécurité', -820, -320],
  ['cloud', 'Cloud', 660, -320],
  ['soft', 'Génie Logiciel', -340, 40],
  ['data', 'Data', 440, 160],
  ['archi', 'Architecture', -900, 240],
  ['green', 'Green IT', 1000, 40],
  ['crit', 'Systèmes Critiques', 180, 440],
  ['priv', 'Vie Privée & Conformité', -440, 520],
];

const DOMAIN_LINKS: readonly [string, string][] = [
  ['ia', 'data'],
  ['cloud', 'archi'],
  ['cyber', 'priv'],
  ['soft', 'archi'],
  ['data', 'cloud'],
  ['ia', 'cloud'],
  ['soft', 'crit'],
  ['archi', 'crit'],
  ['green', 'cloud'],
  ['priv', 'data'],
  ['ia', 'soft'],
  ['cyber', 'cloud'],
];

const TOPICS: Readonly<Record<string, readonly string[]>> = {
  ia: ['Machine Learning', 'Deep Learning', 'NLP', 'IA Générative', 'MLOps', 'Vision par ordinateur'],
  cyber: ['SOC & Détection', 'Pentest', 'Gouvernance SSI', 'Cryptographie', 'Identité & Accès', 'Sécurité Cloud'],
  cloud: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'FinOps', 'Platform Engineering'],
  soft: ['Java', 'Spring Boot', 'Angular', 'Microservices', 'DevOps', 'Qualité & Tests'],
  data: ['Data Engineering', 'Data Science', 'BI & Analytics', 'Streaming', 'Data Mesh'],
  archi: ['Architecture SI', 'Urbanisation', 'TOGAF & Cadres', 'Intégration', 'Résilience'],
  green: ['Éco-conception', 'Sobriété Numérique', 'Mesure Carbone', 'Achats Responsables'],
  crit: ['Temps Réel', 'Systèmes Financiers', 'Embarqué', 'Haute Disponibilité'],
  priv: ['RGPD', 'Privacy by Design', 'Audit & Conformité', 'Éthique du Numérique'],
};

const EXTRA_TOPIC_LINKS: readonly [string, string, string, string][] = [
  ['soft', 'Microservices', 'archi', 'Architecture SI'],
  ['cloud', 'Kubernetes', 'soft', 'DevOps'],
  ['ia', 'MLOps', 'cloud', 'Platform Engineering'],
  ['data', 'Streaming', 'crit', 'Temps Réel'],
  ['cyber', 'Sécurité Cloud', 'cloud', 'AWS'],
  ['priv', 'RGPD', 'data', 'Data Engineering'],
];

type CertChainEntry = readonly [string, string];

const CERTS: readonly (readonly [string, string, readonly CertChainEntry[]])[] = [
  [
    'cloud',
    'AWS',
    [
      ['AWS Cloud Practitioner', 'AWS'],
      ['AWS Developer Associate', 'AWS'],
      ['AWS Solutions Architect', 'AWS'],
    ],
  ],
  [
    'cloud',
    'Azure',
    [
      ['Azure Fundamentals AZ-900', 'Microsoft'],
      ['Azure Administrator AZ-104', 'Microsoft'],
    ],
  ],
  ['cloud', 'Kubernetes', [['CKA — Kubernetes Administrator', 'Linux Foundation']]],
  [
    'cyber',
    'Gouvernance SSI',
    [
      ['CISSP', 'ISC²'],
      ['ISO 27001 Lead Implementer', 'PECB'],
    ],
  ],
  ['cyber', 'Pentest', [['CEH — Certified Ethical Hacker', 'EC-Council']]],
  ['ia', 'Machine Learning', [['TensorFlow Developer', 'Google']]],
  ['ia', 'IA Générative', [['Azure AI Engineer AI-102', 'Microsoft']]],
  ['data', 'Data Engineering', [['Databricks Data Engineer', 'Databricks']]],
  ['archi', 'TOGAF & Cadres', [['TOGAF 10 Foundation', 'The Open Group']]],
  ['soft', 'Java', [['Oracle Java SE 17 Professional', 'Oracle']]],
];

const FIRST = [
  'Amadou', 'Claire', 'Yuki', 'Rachid', 'Ingrid', 'Sofia', 'Kwame', 'Elena', 'Jean-Marc', 'Priya',
  'Lucas', 'Mei', 'Omar', 'Anna', 'David', 'Fatou', 'Marc', 'Linda', 'Tomás', 'Aïcha', 'Nadia', 'Hugo',
  'Sena', 'Karim',
];
const LAST = [
  'Diallo', 'Fontaine', 'Tanaka', 'Benali', 'Møller', 'Marchetti', 'Mensah', 'Petrova', 'Lavoie',
  'Sharma', 'Oliveira', 'Chen', 'Haddad', 'Kowalska', 'Cohen', 'Ndiaye', 'Dubois', 'Okafor', 'García',
  'Traoré', 'Bergström', 'Marceau', 'Kouassi', 'Aziz',
];
const ROLES = [
  'Architecte Cloud', 'RSSI', 'Ingénieure Data', 'Lead Développeur Java', 'Experte IA',
  'Ingénieur DevOps', 'Architecte SI', 'Consultante Cybersécurité', 'Data Scientist',
  'Ingénieure Plateforme', 'Auditeur SSI', 'CTO',
];
const COMPANIES = [
  'Nexa Conseil', 'Atlas Digital', 'Helvetia Systems', 'Quantica', 'Cap Azur', 'Nordis', 'Dakar Tech',
  'Ligne Claire', 'Systémia', 'Boréal IT',
];
const COUNTRIES = [
  'France', 'Suisse', 'Belgique', 'Canada', 'Maroc', 'Sénégal', 'Tunisie', "Côte d'Ivoire",
  'Luxembourg', 'Cameroun',
];
const BADGES = ['Mentor OEI', 'Conférencier', 'Publication 2026', 'Jury de certification', 'Contributeur Open Source'];

const EXPERT_COUNT = 52;

function makeNode(partial: Omit<NetworkNode, '_dx' | '_dy'>): NetworkNode {
  return { ...partial, _dx: 0, _dy: 0 };
}

/** Builds the demo graph. Pure function, deterministic (seed 42), same as the design reference. */
export function generateNetworkGraph(): NetworkGraph {
  const R = mkRng(42);
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const byId = new Map<string, NetworkNode>();

  const add = (n: NetworkNode): NetworkNode => {
    nodes.push(n);
    byId.set(n.id, n);
    return n;
  };
  const link = (a: string, b: string, kind: NetworkEdgeKind): void => {
    edges.push({ a, b, kind, ph: R() * 1, sp: 0.12 + R() * 0.18 });
  };

  for (const [id, label, x, y] of DOMS) {
    const sat: [number, number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const a = R() * 6.283;
      const r = 18 + R() * 62;
      sat.push([Math.cos(a) * r, Math.sin(a) * r, 1 + R() * 2]);
    }
    add(makeNode({ id: 'd-' + id, kind: 'domain', label, x, y, r: 26, ph: R() * 6, sat }));
  }
  for (const [a, b] of DOMAIN_LINKS) link('d-' + a, 'd-' + b, 'dd');

  const topicsByDom: Record<string, NetworkNode[]> = {};
  for (const dk of Object.keys(TOPICS)) {
    const d = byId.get('d-' + dk)!;
    const list = TOPICS[dk];
    topicsByDom[dk] = [];
    list.forEach((label, i) => {
      const a = i * 2.39996 + R() * 0.5;
      const r = 140 + (i % 2 ? 70 : 0) + R() * 40;
      const t = add(
        makeNode({
          id: 't-' + dk + '-' + i,
          kind: 'topic',
          label,
          dom: dk,
          x: d.x + Math.cos(a) * r,
          y: d.y + Math.sin(a) * r,
          r: 11,
          ph: R() * 6,
        }),
      );
      topicsByDom[dk].push(t);
      link(d.id, t.id, 'dt');
      if (i > 0 && R() < 0.7) link(topicsByDom[dk][i - 1].id, t.id, 'tt');
    });
  }
  const tid = (dk: string, label: string): string => topicsByDom[dk].find((t) => t.label === label)!.id;
  for (const [dkA, labelA, dkB, labelB] of EXTRA_TOPIC_LINKS) {
    link(tid(dkA, labelA), tid(dkB, labelB), 'tt');
  }

  const certNodes: NetworkNode[] = [];
  const providers = new Set<string>();
  for (const [dk, tLabel, chain] of CERTS) {
    const t = byId.get(tid(dk, tLabel))!;
    const d = byId.get('d-' + dk)!;
    const ux = t.x - d.x;
    const uy = t.y - d.y;
    const len = Math.hypot(ux, uy) || 1;
    let prev: NetworkNode | null = null;
    chain.forEach(([label, provider], i) => {
      const c = add(
        makeNode({
          id: 'c-' + label.replace(/\W/g, ''),
          kind: 'cert',
          label,
          provider,
          dom: dk,
          topic: t.id,
          x: t.x + (ux / len) * (52 + i * 50) + (-uy / len) * 14,
          y: t.y + (uy / len) * (52 + i * 50) + (ux / len) * 14,
          r: 9,
          ph: R() * 6,
          prereq: prev ? prev.label : 'Aucun prérequis',
          desc:
            'Certification ' +
            provider +
            ' attestant la maîtrise opérationnelle du domaine « ' +
            tLabel +
            ' ». Reconnue par l\'OEI dans le référentiel des parcours d\'expertise.',
          comps: [tLabel, 'Bonnes pratiques', 'Mise en production'],
          valid: '3 ans',
        }),
      );
      providers.add(provider);
      link(prev ? prev.id : t.id, c.id, prev ? 'cc' : 'tc');
      prev = c;
      certNodes.push(c);
    });
  }

  const allTopics = nodes.filter((n) => n.kind === 'topic');
  const domKeys = Object.keys(TOPICS);
  for (let i = 0; i < EXPERT_COUNT; i++) {
    const t = allTopics[Math.floor(R() * allTopics.length)];
    const a = R() * 6.283;
    const r = 22 + R() * 22;
    const name = FIRST[(i * 7) % FIRST.length] + ' ' + LAST[(i * 11 + 3) % LAST.length];
    const domCerts = certNodes.filter((c) => c.dom === t.dom);
    const certs = (domCerts.length ? domCerts : certNodes).slice(0, 1 + Math.floor(R() * 2)).map((c) => c.label);
    const jd: string[] = [t.dom!];
    while (jd.length < 3) {
      const k = domKeys[Math.floor(R() * domKeys.length)];
      if (!jd.includes(k)) jd.push(k);
    }
    const journey = jd
      .slice()
      .reverse()
      .flatMap((k) => {
        const ts = topicsByDom[k];
        const n = k === t.dom ? 2 : 1 + Math.floor(R() * 2);
        const out: string[] = [];
        for (let j = 0; j < n; j++) out.push(ts[Math.floor(R() * ts.length)].id);
        return out;
      });
    if (journey[journey.length - 1] !== t.id) journey.push(t.id);
    const e = add(
      makeNode({
        id: 'e-' + i,
        kind: 'expert',
        label: name,
        dom: t.dom,
        topic: t.id,
        x: t.x + Math.cos(a) * r,
        y: t.y + Math.sin(a) * r,
        r: 6.5,
        ph: R() * 6,
        role: ROLES[(i * 5) % ROLES.length],
        company: COMPANIES[(i * 3) % COMPANIES.length],
        country: COUNTRIES[(i * 7 + 2) % COUNTRIES.length],
        level: (['I', 'II', 'III'] as const)[Math.floor(R() * 3)],
        score: 700 + Math.floor(R() * 290),
        certs,
        badges: [BADGES[(i * 3) % 5], BADGES[(i * 3 + 2) % 5]].slice(0, 1 + (i % 2)),
        journey: [...new Set(journey)],
      }),
    );
    link(t.id, e.id, 'te');
  }
  for (const c of certNodes) {
    c.expCount = nodes.filter((n) => n.kind === 'expert' && n.certs?.includes(c.label)).length;
  }

  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!adj.has(e.a)) adj.set(e.a, new Set());
    if (!adj.has(e.b)) adj.set(e.b, new Set());
    adj.get(e.a)!.add(e.b);
    adj.get(e.b)!.add(e.a);
  }

  const stars: NetworkStar[] = [];
  for (let i = 0; i < 260; i++) {
    stars.push({ x: (R() - 0.5) * 4200, y: (R() - 0.5) * 2800, r: R() * 1.4 + 0.3, phase: R() * 6.28 });
  }

  return { nodes, edges, byId, adj, countries: COUNTRIES, providers: [...providers], stars };
}
