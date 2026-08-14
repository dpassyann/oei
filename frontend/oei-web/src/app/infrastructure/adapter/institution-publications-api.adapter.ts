import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionPublicationsPort } from '../../domain/port/institution/institution-publications.port';
import { InstitutionPublication, InstitutionPublicationCreation } from '../../domain/model/institution/institution-publication';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionPublicationsApiAdapter implements InstitutionPublicationsPort {
  private readonly http = inject(HttpClient);

  listPublications(): Observable<InstitutionPublication[]> {
    return this.http.get<InstitutionPublication[]>(`${INSTITUTION_API_BASE}/publications`);
  }

  getPublication(id: string): Observable<InstitutionPublication> {
    return this.http.get<InstitutionPublication>(`${INSTITUTION_API_BASE}/publications/${id}`);
  }

  createPublication(creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    return this.http.post<InstitutionPublication>(`${INSTITUTION_API_BASE}/publications`, creation);
  }

  updatePublication(id: string, creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    return this.http.put<InstitutionPublication>(`${INSTITUTION_API_BASE}/publications/${id}`, creation);
  }

  submitPublication(id: string): Observable<InstitutionPublication> {
    return this.http.post<InstitutionPublication>(`${INSTITUTION_API_BASE}/publications/${id}/submit`, {});
  }
}
