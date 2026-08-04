import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { InstitutionPublicPort } from '../../domain/port/institution/institution-public.port';
import { createInstitutionPublicPage, InstitutionPublicPage } from '../../domain/model/institution/institution-public-page';
import { DEMO_INSTITUTION, DEMO_OPPORTUNITIES, DEMO_PARTNERSHIP, DEMO_PUBLICATIONS } from './institution-demo-data';

// Tout contenu de la page publique est modéré (doc 03 §"Page publique") : seules les
// publications/opportunités au statut PUBLISHED apparaissent ici.
@Service()
export class InstitutionPublicMockAdapter implements InstitutionPublicPort {
  getPublicInstitution(slug: string): Observable<InstitutionPublicPage> {
    if (slug !== DEMO_INSTITUTION.publicSlug) {
      return throwError(() => new Error(`Institution not found: ${slug}`));
    }
    return of(
      createInstitutionPublicPage({
        institution: DEMO_INSTITUTION,
        partnership: DEMO_PARTNERSHIP,
        publications: DEMO_PUBLICATIONS.filter((publication) => publication.status === 'PUBLISHED'),
        opportunities: DEMO_OPPORTUNITIES.filter((opportunity) => opportunity.status === 'PUBLISHED'),
      }),
    );
  }
}
