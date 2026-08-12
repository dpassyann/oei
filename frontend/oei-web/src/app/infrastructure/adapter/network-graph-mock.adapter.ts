import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  NetworkGraphPort,
  NetworkTopicsAndCertifications,
  OffsetPage,
  PagedResult,
} from '../../domain/port/network/network-graph.port';
import { NetworkDomain } from '../../domain/model/network/network-domain.model';
import { NetworkTopic } from '../../domain/model/network/network-topic.model';
import { NetworkCertification } from '../../domain/model/network/network-certification.model';
import { NetworkExpert } from '../../domain/model/network/network-expert.model';
import {
  NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES,
  NetworkSalaryInsight,
  NetworkSalaryNodeType,
} from '../../domain/model/network/network-salary-insight.model';
import { CompensationPeriod } from '../../domain/model/profile/professional-profile';
import { MIN_ANONYMIZED_SAMPLE_SIZE } from '../../domain/model/shared/anonymization';

// Demonstration dataset — same 9 OEI expertise domains, ~54 topics, 10 real-world
// certification chains and 52 fictitious member experts as the design reference
// (`.prompt/media/r-seau-neuronal-professionnel-oei/project/Reseau Neuronal OEI.dc.html`), and
// intentionally still in French (demo *content*, not site chrome — see
// `presentation/pages/reseau-neuronal/reseau-neuronal.ts` doc comment). The difference from the
// former `generateNetworkGraph()` is that this dataset is now served *through the port*, split
// by domain/topic and paginated for experts, instead of handed to the canvas as one giant blob.

// Deterministic seeded PRNG (sfc32-ish mix), same algorithm as the original design reference —
// kept so the demo dataset stays reproducible run to run.
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
export const NETWORK_DEMO_COUNTRIES = [
  'France', 'Suisse', 'Belgique', 'Canada', 'Maroc', 'Sénégal', 'Tunisie', "Côte d'Ivoire",
  'Luxembourg', 'Cameroun',
];
const BADGES = ['Mentor OEI', 'Conférencier', 'Publication 2026', 'Jury de certification', 'Contributeur Open Source'];

const EXPERT_COUNT = 52;

interface DemoDataset {
  readonly domains: readonly NetworkDomain[];
  readonly topicsByDomain: ReadonlyMap<string, readonly NetworkTopic[]>;
  readonly certificationsByDomain: ReadonlyMap<string, readonly NetworkCertification[]>;
  readonly expertsByTopic: ReadonlyMap<string, readonly NetworkExpert[]>;
}

/** Builds the demo dataset. Pure function, deterministic (seed 42) — computed once and cached
 *  by the adapter (see `dataset()` below), then served per-domain/per-topic through the port. */
function buildDemoDataset(): DemoDataset {
  const R = mkRng(42);

  const domains: NetworkDomain[] = DOMS.map(([id, label, x, y]) => ({
    id: 'd-' + id,
    label,
    x,
    y,
    neighborDomainIds: DOMAIN_LINKS.filter(([a, b]) => a === id || b === id).map((pair) =>
      'd-' + (pair[0] === id ? pair[1] : pair[0]),
    ),
  }));

  const topicsByDomainKey: Record<string, NetworkTopic[]> = {};
  const topicPositionById = new Map<string, { x: number; y: number }>();
  for (const [dk, label, dx, dy] of DOMS) {
    const list = TOPICS[dk];
    topicsByDomainKey[dk] = [];
    list.forEach((topicLabel, i) => {
      const a = i * 2.39996 + R() * 0.5;
      const r = 140 + (i % 2 ? 70 : 0) + R() * 40;
      const id = 't-' + dk + '-' + i;
      const x = dx + Math.cos(a) * r;
      const y = dy + Math.sin(a) * r;
      topicPositionById.set(id, { x, y });
      topicsByDomainKey[dk].push({ id, domainId: 'd-' + dk, label: topicLabel, x, y, relatedTopicIds: [] });
      if (i > 0 && R() < 0.7) {
        const prev = topicsByDomainKey[dk][i - 1];
        (topicsByDomainKey[dk][i].relatedTopicIds as string[]).push(prev.id);
      }
    });
  }
  const topicId = (dk: string, label: string): string =>
    topicsByDomainKey[dk].find((t) => t.label === label)!.id;
  for (const [dkA, labelA, dkB, labelB] of EXTRA_TOPIC_LINKS) {
    const a = topicsByDomainKey[dkA].find((t) => t.id === topicId(dkA, labelA))!;
    (a.relatedTopicIds as string[]).push(topicId(dkB, labelB));
  }

  const certificationsByDomainKey: Record<string, NetworkCertification[]> = {};
  for (const dk of Object.keys(TOPICS)) certificationsByDomainKey[dk] = [];
  const certLabelById = new Map<string, string>();
  for (const [dk, tLabel, chain] of CERTS) {
    const tId = topicId(dk, tLabel);
    const tPos = topicPositionById.get(tId)!;
    const dPos = DOMS.find(([id]) => id === dk)!;
    const ux = tPos.x - dPos[2];
    const uy = tPos.y - dPos[3];
    const len = Math.hypot(ux, uy) || 1;
    let prevId: string | null = null;
    chain.forEach(([label, provider], i) => {
      const id = 'c-' + label.replace(/\W/g, '');
      const x = tPos.x + (ux / len) * (52 + i * 50) + (-uy / len) * 14;
      const y = tPos.y + (uy / len) * (52 + i * 50) + (ux / len) * 14;
      certLabelById.set(id, label);
      certificationsByDomainKey[dk].push({
        id,
        topicId: tId,
        domainId: 'd-' + dk,
        label,
        provider,
        prereqCertificationId: prevId,
        description:
          'Certification ' +
          provider +
          ' attestant la maîtrise opérationnelle du domaine « ' +
          tLabel +
          ' ». Reconnue par l\'OEI dans le référentiel des parcours d\'expertise.',
        validatedSkills: [tLabel, 'Bonnes pratiques', 'Mise en production'],
        validityPeriod: '3 ans',
        expertCount: 0,
        x,
        y,
      });
      prevId = id;
    });
  }
  const allCertifications = Object.values(certificationsByDomainKey).flat();

  const allTopics = Object.values(topicsByDomainKey).flat();
  const domainKeys = Object.keys(TOPICS);
  const expertsByTopicKey = new Map<string, NetworkExpert[]>();
  const certLabelCounts = new Map<string, number>();
  for (let i = 0; i < EXPERT_COUNT; i++) {
    const t = allTopics[Math.floor(R() * allTopics.length)];
    const dk = t.domainId.slice(2);
    const domCerts = certificationsByDomainKey[dk].length ? certificationsByDomainKey[dk] : allCertifications;
    const certs = domCerts.slice(0, 1 + Math.floor(R() * 2)).map((c) => c.label);
    for (const label of certs) certLabelCounts.set(label, (certLabelCounts.get(label) ?? 0) + 1);
    const jd: string[] = [dk];
    while (jd.length < 3) {
      const k = domainKeys[Math.floor(R() * domainKeys.length)];
      if (!jd.includes(k)) jd.push(k);
    }
    const journey = jd
      .slice()
      .reverse()
      .flatMap((k) => {
        const ts = topicsByDomainKey[k];
        const n = k === dk ? 2 : 1 + Math.floor(R() * 2);
        const out: string[] = [];
        for (let j = 0; j < n; j++) out.push(ts[Math.floor(R() * ts.length)].id);
        return out;
      });
    if (journey[journey.length - 1] !== t.id) journey.push(t.id);

    const a = R() * 6.283;
    const r = 22 + R() * 22;
    const expert: NetworkExpert = {
      id: 'e-' + i,
      topicId: t.id,
      domainId: t.domainId,
      label: FIRST[(i * 7) % FIRST.length] + ' ' + LAST[(i * 11 + 3) % LAST.length],
      role: ROLES[(i * 5) % ROLES.length],
      company: COMPANIES[(i * 3) % COMPANIES.length],
      country: NETWORK_DEMO_COUNTRIES[(i * 7 + 2) % NETWORK_DEMO_COUNTRIES.length],
      level: (['I', 'II', 'III'] as const)[Math.floor(R() * 3)],
      score: 700 + Math.floor(R() * 290),
      certificationLabels: certs,
      badges: [BADGES[(i * 3) % 5], BADGES[(i * 3 + 2) % 5]].slice(0, 1 + (i % 2)),
      journeyTopicIds: [...new Set(journey)],
      x: t.x + Math.cos(a) * r,
      y: t.y + Math.sin(a) * r,
    };
    const list = expertsByTopicKey.get(t.id) ?? [];
    list.push(expert);
    expertsByTopicKey.set(t.id, list);
  }
  for (const cert of allCertifications) {
    (cert as { expertCount: number }).expertCount = certLabelCounts.get(cert.label) ?? 0;
  }

  return {
    domains,
    topicsByDomain: new Map(Object.entries(topicsByDomainKey)),
    certificationsByDomain: new Map(Object.entries(certificationsByDomainKey)),
    expertsByTopic: expertsByTopicKey,
  };
}

// ---------------------------------------------------------------------------------------------
// Salary transparency demo data (`NetworkGraphPort.getSalaryInsight`)
// ---------------------------------------------------------------------------------------------
// Real member `CurrentCompensation` declarations don't exist yet (see that model's doc
// comment), so — same spirit as `SalaryBenchmarkMockAdapter`'s `DEMO_SAMPLES` — this generates a
// small, deterministic, clearly fictional anonymized pool per domain/topic/certification node,
// split by the two `NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES`. As real declarations start
// accumulating, this is meant to be replaced by a real backend aggregation behind
// `NetworkGraphApiAdapter.getSalaryInsight`, computing the same shape from actual anonymized
// data — never individual figures.

const SALARY_INSIGHT_CURRENCY = 'CHF';
const SALARY_INSIGHT_PERIOD: CompensationPeriod = 'YEAR';

interface SalaryCountryPool {
  readonly country: string;
  readonly low: number;
  readonly high: number;
  readonly sampleSize: number;
}

interface SalaryInsightEntry {
  readonly currency: string;
  readonly period: CompensationPeriod;
  readonly pools: readonly SalaryCountryPool[];
}

/** Builds one deterministic salary insight entry per domain/topic/certification node, keyed by
 *  node id. Each entry's pools are deliberately shaped so the *first* candidate country always
 *  reaches `MIN_ANONYMIZED_SAMPLE_SIZE` and the *second* never does — every node in the demo
 *  dataset exercises both the "range shown" and "not enough data" cases (per country; the
 *  country-agnostic aggregate always clears the threshold via the first country alone), without
 *  needing to special-case any particular node id in tests or in the UI. */
function buildSalaryInsightDataset(dataset: DemoDataset): ReadonlyMap<string, SalaryInsightEntry> {
  const ids: readonly string[] = [
    ...dataset.domains.map((d) => d.id),
    ...[...dataset.topicsByDomain.values()].flat().map((t) => t.id),
    ...[...dataset.certificationsByDomain.values()].flat().map((c) => c.id),
  ];
  const entries = new Map<string, SalaryInsightEntry>();
  ids.forEach((id, i) => {
    // Seeded per node index (not per node id string) — simpler than hashing the id and just as
    // deterministic/reproducible, consistent with `buildDemoDataset`'s single-seed-42 approach.
    const R = mkRng(1000 + i);
    const base = 70000 + Math.floor(R() * 90000);
    const pools: SalaryCountryPool[] = NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES.map((country, countryIndex) => {
      const spread = 8000 + Math.floor(R() * 20000);
      const sampleSize =
        countryIndex === 0
          ? MIN_ANONYMIZED_SAMPLE_SIZE + Math.floor(R() * 9)
          : Math.floor(R() * MIN_ANONYMIZED_SAMPLE_SIZE);
      return { country, low: base - spread, high: base + spread + Math.floor(R() * 15000), sampleSize };
    });
    entries.set(id, { currency: SALARY_INSIGHT_CURRENCY, period: SALARY_INSIGHT_PERIOD, pools });
  });
  return entries;
}

/** Resolves one entry's pools (optionally narrowed to one country) into the value the port
 *  exposes — `undefined` whenever the resulting pool has fewer than `MIN_ANONYMIZED_SAMPLE_SIZE`
 *  contributors, per `NetworkGraphPort.getSalaryInsight`'s doc comment. */
function resolveSalaryInsight(entry: SalaryInsightEntry | undefined, country?: string): NetworkSalaryInsight | undefined {
  if (!entry) {
    return undefined;
  }
  const pools = country ? entry.pools.filter((pool) => pool.country === country) : entry.pools;
  const sampleSize = pools.reduce((sum, pool) => sum + pool.sampleSize, 0);
  if (pools.length === 0 || sampleSize < MIN_ANONYMIZED_SAMPLE_SIZE) {
    return undefined;
  }
  return {
    low: Math.min(...pools.map((pool) => pool.low)),
    high: Math.max(...pools.map((pool) => pool.high)),
    currency: entry.currency,
    period: entry.period,
    sampleSize,
    country,
  };
}

@Service()
export class NetworkGraphMockAdapter implements NetworkGraphPort {
  // Computed once per adapter instance (Angular services are singletons app-wide), then served
  // per-domain/per-topic slices below — mirrors a real backend that would already have this
  // normalized in a database, filtered/paginated on read rather than regenerated per request.
  private readonly dataset: DemoDataset = buildDemoDataset();
  private readonly salaryInsightByNodeId: ReadonlyMap<string, SalaryInsightEntry> = buildSalaryInsightDataset(this.dataset);

  listDomains(): Observable<readonly NetworkDomain[]> {
    return of(this.dataset.domains);
  }

  listTopicsAndCertifications(domainId: string): Observable<NetworkTopicsAndCertifications> {
    const key = domainId.replace(/^d-/, '');
    return of({
      topics: this.dataset.topicsByDomain.get(key) ?? [],
      certifications: this.dataset.certificationsByDomain.get(key) ?? [],
    });
  }

  listExperts(topicId: string, page: OffsetPage): Observable<PagedResult<NetworkExpert>> {
    const all = this.dataset.expertsByTopic.get(topicId) ?? [];
    const items = all.slice(page.offset, page.offset + page.limit);
    return of({ items, total: all.length });
  }

  getSalaryInsight(nodeType: NetworkSalaryNodeType, nodeId: string, country?: string): Observable<NetworkSalaryInsight | undefined> {
    // Node ids already carry a unique `d-`/`t-`/`c-` prefix, so `nodeType` isn't needed to
    // disambiguate here — kept as a parameter only for parity with the port's contract, which a
    // real backend would use to route to the right aggregation table.
    void nodeType;
    return of(resolveSalaryInsight(this.salaryInsightByNodeId.get(nodeId), country));
  }
}
