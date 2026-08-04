import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionOpportunitiesPort } from '../../domain/port/institution/institution-opportunities.port';
import { InstitutionOpportunity, InstitutionOpportunityCreation } from '../../domain/model/institution/institution-opportunity';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionOpportunitiesApiAdapter implements InstitutionOpportunitiesPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listOpportunities(): Observable<InstitutionOpportunity[]> {
    return this.http.get<InstitutionOpportunity[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/opportunities`);
  }

  createOpportunity(creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    return this.http.post<InstitutionOpportunity>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/opportunities`, creation);
  }

  updateOpportunity(id: string, creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    return this.http.put<InstitutionOpportunity>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/opportunities/${id}`, creation);
  }

  closeOpportunity(id: string): Observable<InstitutionOpportunity> {
    return this.http.post<InstitutionOpportunity>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/opportunities/${id}/close`, {});
  }
}
