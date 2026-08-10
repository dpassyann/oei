import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NetworkGraphPort,
  NetworkTopicsAndCertifications,
  OffsetPage,
  PagedResult,
} from '../../domain/port/network/network-graph.port';
import { NetworkDomain } from '../../domain/model/network/network-domain.model';
import { NetworkExpert } from '../../domain/model/network/network-expert.model';

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
}
