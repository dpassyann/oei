import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_OPPORTUNITIES_PORT } from '../../domain/port/institution/institution-opportunities.port';
import { InstitutionOpportunity, InstitutionOpportunityCreation } from '../../domain/model/institution/institution-opportunity';

@Service()
export class InstitutionOpportunitiesApplicationService {
  private readonly port = inject(INSTITUTION_OPPORTUNITIES_PORT);

  listOpportunities(): Observable<InstitutionOpportunity[]> {
    return this.port.listOpportunities();
  }

  createOpportunity(creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    return this.port.createOpportunity(creation);
  }

  updateOpportunity(id: string, creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    return this.port.updateOpportunity(id, creation);
  }

  closeOpportunity(id: string): Observable<InstitutionOpportunity> {
    return this.port.closeOpportunity(id);
  }
}
