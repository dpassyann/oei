import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NetworkDomain } from '../../model/network/network-domain.model';
import { NetworkTopic } from '../../model/network/network-topic.model';
import { NetworkCertification } from '../../model/network/network-certification.model';
import { NetworkExpert } from '../../model/network/network-expert.model';
import { NetworkSalaryInsight, NetworkSalaryNodeType } from '../../model/network/network-salary-insight.model';

export interface NetworkTopicsAndCertifications {
  readonly topics: readonly NetworkTopic[];
  readonly certifications: readonly NetworkCertification[];
}

export interface OffsetPage {
  readonly offset: number;
  readonly limit: number;
}

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
}

/**
 * Port for the Professional Neural Network canvas explorer's knowledge graph (domains →
 * topics/certifications → experts).
 *
 * Deliberately shaped around the canvas's zoom levels instead of a single "give me the whole
 * graph" call — the previous implementation (`network-graph.ts`'s `generateNetworkGraph()`)
 * built the full 9-domain / ~54-topic / 10-certification / 52-expert dataset in memory on every
 * page load, which does not scale once domains/certifications/experts are real, persisted OEI
 * data instead of a fixed demo dataset:
 *
 * - `listDomains` always runs on page load — small, fixed-size dataset (~10 rows), needed to
 *   draw the initial "galaxy" view.
 * - `listTopicsAndCertifications` runs once per domain, only the first time the user zooms into
 *   that domain (topics/certifications are cheap enough per domain to load in one shot).
 * - `listExperts` is the one resource that can genuinely grow without bound (every OEI member
 *   with expertise in a topic), so it is truly paginated (`offset`/`limit` in, `items`/`total`
 *   out) and is only called once the user reaches the "experts" zoom level for a given topic —
 *   first page eagerly, further pages only on explicit "load more".
 *
 * Future backend mapping: this `{ offset, limit }` → `{ items, total }` contract is written to
 * map directly onto Spring Data JPA paging — `offset`/`limit` becomes
 * `PageRequest.of(offset / limit, limit)` (assuming a `limit`-aligned offset, as the canvas
 * always requests) and `total` becomes `Page<NetworkExpertEntity>#getTotalElements()`. Domains
 * and per-domain topics/certifications are expected to stay small enough server-side that they
 * don't need `Pageable` at all, only a `WHERE domain_id = :domainId` filter.
 */
export interface NetworkGraphPort {
  listDomains(): Observable<readonly NetworkDomain[]>;

  listTopicsAndCertifications(domainId: string): Observable<NetworkTopicsAndCertifications>;

  listExperts(topicId: string, page: OffsetPage): Observable<PagedResult<NetworkExpert>>;

  /**
   * Anonymized salary transparency for one graph node (domain/topic/certification), optionally
   * narrowed to one `country` (same free-text format as `NetworkExpert.country`). Resolves to
   * `undefined` — a value state, not an error, same convention as `PublicProfilePort.getBySlug`
   * and `SalaryBenchmarkPort.getBenchmark` — whenever the anonymized pool of member
   * `CurrentCompensation` declarations attached to that node (and country, if given) has fewer
   * than `MIN_ANONYMIZED_SAMPLE_SIZE` contributors. Never resolves to a range built from an
   * individual figure.
   */
  getSalaryInsight(
    nodeType: NetworkSalaryNodeType,
    nodeId: string,
    country?: string,
  ): Observable<NetworkSalaryInsight | undefined>;
}

export const NETWORK_GRAPH_PORT = new InjectionToken<NetworkGraphPort>('NetworkGraphPort');
