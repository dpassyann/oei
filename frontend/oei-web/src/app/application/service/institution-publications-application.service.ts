import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_PUBLICATIONS_PORT } from '../../domain/port/institution/institution-publications.port';
import { InstitutionPublication, InstitutionPublicationCreation } from '../../domain/model/institution/institution-publication';

@Service()
export class InstitutionPublicationsApplicationService {
  private readonly port = inject(INSTITUTION_PUBLICATIONS_PORT);

  listPublications(): Observable<InstitutionPublication[]> {
    return this.port.listPublications();
  }

  getPublication(id: string): Observable<InstitutionPublication> {
    return this.port.getPublication(id);
  }

  createPublication(creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    return this.port.createPublication(creation);
  }

  updatePublication(id: string, creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    return this.port.updatePublication(id, creation);
  }

  submitPublication(id: string): Observable<InstitutionPublication> {
    return this.port.submitPublication(id);
  }
}
