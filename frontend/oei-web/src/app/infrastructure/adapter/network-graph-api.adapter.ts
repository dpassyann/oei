import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
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

  // No real backend endpoint exists yet for this feature (see the port's doc comment on the
  // anonymization threshold) — written exactly as the rest of this adapter's methods, assuming
  // a real backend to call, and falling back to the `undefined` value state (rather than
  // propagating an error) on any failure, same convention as `SalaryBenchmarkApiAdapter`.
  getSalaryInsight(
    nodeType: NetworkSalaryNodeType,
    nodeId: string,
    country?: string,
  ): Observable<NetworkSalaryInsight | undefined> {
    return this.http
      .get<NetworkSalaryInsight | undefined>(`${NETWORK_API_BASE}/salary-insight`, {
        params: country ? { nodeType, nodeId, country } : { nodeType, nodeId },
      })
      .pipe(catchError(() => of(undefined)));
  }
}
