import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { InstitutionOpportunitiesPort } from '../../domain/port/institution/institution-opportunities.port';
import {
  createInstitutionOpportunity,
  InstitutionOpportunity,
  InstitutionOpportunityCreation,
} from '../../domain/model/institution/institution-opportunity';
import { DEMO_INSTITUTION_ID, DEMO_OPPORTUNITIES } from './institution-demo-data';

let nextOpportunitySequence = 1;

@Service()
export class InstitutionOpportunitiesMockAdapter implements InstitutionOpportunitiesPort {
  private opportunities: InstitutionOpportunity[] = [...DEMO_OPPORTUNITIES];

  listOpportunities(): Observable<InstitutionOpportunity[]> {
    return of(this.opportunities);
  }

  createOpportunity(creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    // Créée directement PUBLISHED en mock (pas de modération OEI simulée ici) — voir doc 03
    // §"Opportunités" : modération, durée et transparence restent des règles portées par le
    // futur backend.
    const opportunity = createInstitutionOpportunity({
      id: `institution-opportunity-demo-new-${nextOpportunitySequence++}`,
      institutionId: DEMO_INSTITUTION_ID,
      type: creation.type,
      title: creation.title,
      description: creation.description,
      status: 'PUBLISHED',
      expiresAt: creation.expiresAt,
      publishedAt: new Date().toISOString(),
    });
    this.opportunities = [...this.opportunities, opportunity];
    return of(opportunity);
  }

  updateOpportunity(id: string, creation: InstitutionOpportunityCreation): Observable<InstitutionOpportunity> {
    const existing = this.opportunities.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => new Error(`Institution opportunity not found: ${id}`));
    }
    const updated = createInstitutionOpportunity({ ...existing, ...creation });
    this.opportunities = this.opportunities.map((item) => (item.id === id ? updated : item));
    return of(updated);
  }

  closeOpportunity(id: string): Observable<InstitutionOpportunity> {
    const existing = this.opportunities.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => new Error(`Institution opportunity not found: ${id}`));
    }
    const closed = createInstitutionOpportunity({ ...existing, status: 'CLOSED' });
    this.opportunities = this.opportunities.map((item) => (item.id === id ? closed : item));
    return of(closed);
  }
}
