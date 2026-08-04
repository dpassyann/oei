import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionOpportunity, InstitutionOpportunityCreation } from '../../model/institution/institution-opportunity';

// `GET/POST /api/institution/v1/opportunities`, `PUT /api/institution/v1/opportunities/{id}`,
// `POST /api/institution/v1/opportunities/{id}/close`.
export interface InstitutionOpportunitiesPort {
  listOpportunities(): Observable<InstitutionOpportunity[]>;
  createOpportunity(creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity>;
  updateOpportunity(id: string, creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity>;
  closeOpportunity(id: string): Observable<InstitutionOpportunity>;
}

export const INSTITUTION_OPPORTUNITIES_PORT = new InjectionToken<InstitutionOpportunitiesPort>('InstitutionOpportunitiesPort');
