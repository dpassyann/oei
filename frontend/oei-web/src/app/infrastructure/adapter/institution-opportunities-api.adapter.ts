import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionOpportunitiesPort } from '../../domain/port/institution/institution-opportunities.port';
import { InstitutionOpportunity, InstitutionOpportunityCreation } from '../../domain/model/institution/institution-opportunity';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionOpportunitiesApiAdapter implements InstitutionOpportunitiesPort {
  private readonly http = inject(HttpClient);

  listOpportunities(): Observable<InstitutionOpportunity[]> {
    return this.http.get<InstitutionOpportunity[]>(`${INSTITUTION_API_BASE}/opportunities`);
  }

  createOpportunity(creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    return this.http.post<InstitutionOpportunity>(`${INSTITUTION_API_BASE}/opportunities`, creation);
  }

  updateOpportunity(id: string, creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    return this.http.put<InstitutionOpportunity>(`${INSTITUTION_API_BASE}/opportunities/${id}`, creation);
  }

  closeOpportunity(id: string): Observable<InstitutionOpportunity> {
    return this.http.post<InstitutionOpportunity>(`${INSTITUTION_API_BASE}/opportunities/${id}/close`, {});
  }
}
