import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import {
  NetworkGraphPort,
  NetworkTopicsAndCertifications,
  OffsetPage,
  PagedResult,
} from '../../domain/port/network/network-graph.port';
import { NetworkDomain } from '../../domain/model/network/network-domain.model';
import { NetworkExpert } from '../../domain/model/network/network-expert.model';
import { NetworkSalaryInsight, NetworkSalaryNodeType } from '../../domain/model/network/network-salary-insight.model';

const NETWORK_API_BASE = '/api/public/v1/network';

// Path segment for each `NetworkSalaryNodeType`, matching the three distinct
// `getNetwork{Domain,Topic,Certification}SalaryInsight` operations in the OpenAPI contract — the
// backend does not expose a single generic `/salary-insight?nodeType=&nodeId=` endpoint.
const SALARY_INSIGHT_PATH_SEGMENT: Record<NetworkSalaryNodeType, string> = {
  domain: 'domains',
  topic: 'topics',
  certification: 'certifications',
};

@Service()
export class NetworkGraphApiAdapter implements NetworkGraphPort {
  private readonly http = inject(HttpClient);

  listDomains(): Observable<readonly NetworkDomain[]> {
    return this.http.get<readonly NetworkDomain[]>(`${NETWORK_API_BASE}/domains`);
  }

  listTopicsAndCertifications(domainId: string): Observable<NetworkTopicsAndCertifications> {
    return this.http.get<NetworkTopicsAndCertifications>(`${NETWORK_API_BASE}/domains/${domainId}/topics`);
  }

  listExperts(topicId: string, page: OffsetPage): Observable<PagedResult<NetworkExpert>> {
    return this.http.get<PagedResult<NetworkExpert>>(`${NETWORK_API_BASE}/topics/${topicId}/experts`, {
      params: { offset: page.offset, limit: page.limit },
    });
  }

  // The backend resolves to HTTP 204 (empty body) rather than 200 whenever the anonymized pool
  // of `CurrentCompensation` declarations attached to this node (and country, if given) is below
  // `MIN_ANONYMIZED_SAMPLE_SIZE` — Angular's `HttpClient` parses that empty 204 body as `null`,
  // which is mapped here to the `undefined` value state (not an error). Any genuine transport/
  // server error (404 unknown node included) also falls back to `undefined`, same convention as
  // the rest of this port.
  getSalaryInsight(
    nodeType: NetworkSalaryNodeType,
    nodeId: string,
    country?: string,
  ): Observable<NetworkSalaryInsight | undefined> {
    const pathSegment = SALARY_INSIGHT_PATH_SEGMENT[nodeType];
    return this.http
      .get<NetworkSalaryInsight | null>(`${NETWORK_API_BASE}/${pathSegment}/${nodeId}/salary-insight`, {
        params: country ? { country } : {},
      })
      .pipe(
        map((insight) => insight ?? undefined),
        catchError(() => of(undefined)),
      );
  }
}
