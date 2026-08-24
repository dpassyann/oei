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
import { RuntimeConfig } from '../config/runtime-config';

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
  private readonly runtimeConfig = inject(RuntimeConfig);

  private networkApiBaseUrl(): string {
    const apiBaseUrl = this.runtimeConfig.apiBaseUrl();
    if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
      return NETWORK_API_BASE;
    }

    try {
      const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;
      return `${apiOrigin}${NETWORK_API_BASE}`;
    } catch {
      return NETWORK_API_BASE;
    }
  }

  listDomains(): Observable<readonly NetworkDomain[]> {
    return this.http.get<readonly NetworkDomain[]>(`${this.networkApiBaseUrl()}/domains`);
  }

  listTopicsAndCertifications(domainId: string): Observable<NetworkTopicsAndCertifications> {
    return this.http.get<NetworkTopicsAndCertifications>(`${this.networkApiBaseUrl()}/domains/${domainId}/topics`);
  }

  listExperts(topicId: string, page: OffsetPage): Observable<PagedResult<NetworkExpert>> {
    return this.http.get<PagedResult<NetworkExpert>>(`${this.networkApiBaseUrl()}/topics/${topicId}/experts`, {
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
      .get<NetworkSalaryInsight | null>(`${this.networkApiBaseUrl()}/${pathSegment}/${nodeId}/salary-insight`, {
        params: country ? { country } : {},
      })
      .pipe(
        map((insight) => insight ?? undefined),
        catchError(() => of(undefined)),
      );
  }
}
