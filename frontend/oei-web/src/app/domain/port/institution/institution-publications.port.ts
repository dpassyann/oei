import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionPublication, InstitutionPublicationCreation } from '../../model/institution/institution-publication';

// Publications institutionnelles et workflow (brouillon → ... → archivage). Correspond à
// `GET/POST /api/institution/v1/publications`, `GET/PUT /api/institution/v1/publications/{id}`,
// `POST /api/institution/v1/publications/{id}/submit`.
export interface InstitutionPublicationsPort {
  listPublications(): Observable<InstitutionPublication[]>;
  getPublication(id: string): Observable<InstitutionPublication>;
  createPublication(creation: InstitutionPublicationCreation): Observable<InstitutionPublication>;
  updatePublication(id: string, creation: InstitutionPublicationCreation): Observable<InstitutionPublication>;
  submitPublication(id: string): Observable<InstitutionPublication>;
}

export const INSTITUTION_PUBLICATIONS_PORT = new InjectionToken<InstitutionPublicationsPort>('InstitutionPublicationsPort');
