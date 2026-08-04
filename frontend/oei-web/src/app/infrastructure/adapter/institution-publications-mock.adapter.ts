import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { InstitutionPublicationsPort } from '../../domain/port/institution/institution-publications.port';
import {
  createInstitutionPublication,
  InstitutionPublication,
  InstitutionPublicationCreation,
} from '../../domain/model/institution/institution-publication';
import { DEMO_INSTITUTION_ID, DEMO_PUBLICATIONS } from './institution-demo-data';

let nextPublicationSequence = 1;

@Service()
export class InstitutionPublicationsMockAdapter implements InstitutionPublicationsPort {
  private publications: InstitutionPublication[] = [...DEMO_PUBLICATIONS];

  listPublications(): Observable<InstitutionPublication[]> {
    return of(this.publications);
  }

  getPublication(id: string): Observable<InstitutionPublication> {
    const publication = this.publications.find((item) => item.id === id);
    return publication ? of(publication) : throwError(() => new Error(`Institution publication not found: ${id}`));
  }

  createPublication(creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    const publication = createInstitutionPublication({
      id: `institution-publication-demo-new-${nextPublicationSequence++}`,
      institutionId: DEMO_INSTITUTION_ID,
      type: creation.type,
      title: creation.title,
      body: creation.body,
      status: 'DRAFT',
      authorMemberId: 'member-admin-demo',
      submittedAt: null,
      publishedAt: null,
    });
    this.publications = [...this.publications, publication];
    return of(publication);
  }

  updatePublication(id: string, creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    const existing = this.publications.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => new Error(`Institution publication not found: ${id}`));
    }
    // Contrat OpenAPI : seule une publication DRAFT ou CHANGES_REQUESTED peut être modifiée.
    if (existing.status !== 'DRAFT' && existing.status !== 'CHANGES_REQUESTED') {
      return throwError(() => new Error(`Institution publication cannot be edited in status ${existing.status}`));
    }
    const updated = createInstitutionPublication({ ...existing, ...creation });
    this.publications = this.publications.map((item) => (item.id === id ? updated : item));
    return of(updated);
  }

  submitPublication(id: string): Observable<InstitutionPublication> {
    const existing = this.publications.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => new Error(`Institution publication not found: ${id}`));
    }
    // Le mock avance directement en SUBMITTED — les étapes CHECKS/REVIEW/VALIDATED/TRANSLATED/
    // PUBLISHED/ARCHIVED suivantes du workflow (voir `PUBLICATION_WORKFLOW_STEPS`) seront
    // pilotées par la modération OEI (hors périmètre de cet espace institutionnel).
    const submitted = createInstitutionPublication({ ...existing, status: 'SUBMITTED', submittedAt: new Date().toISOString() });
    this.publications = this.publications.map((item) => (item.id === id ? submitted : item));
    return of(submitted);
  }
}
