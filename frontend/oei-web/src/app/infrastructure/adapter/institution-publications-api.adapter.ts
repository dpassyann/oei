import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionPublicationsPort } from '../../domain/port/institution/institution-publications.port';
import { InstitutionPublication, InstitutionPublicationCreation } from '../../domain/model/institution/institution-publication';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionPublicationsApiAdapter implements InstitutionPublicationsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listPublications(): Observable<InstitutionPublication[]> {
    return this.http.get<InstitutionPublication[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/publications`);
  }

  getPublication(id: string): Observable<InstitutionPublication> {
    return this.http.get<InstitutionPublication>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/publications/${id}`);
  }

  createPublication(creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    return this.http.post<InstitutionPublication>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/publications`, creation);
  }

  updatePublication(id: string, creation: InstitutionPublicationCreation): Observable<InstitutionPublication> {
    return this.http.put<InstitutionPublication>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/publications/${id}`, creation);
  }

  submitPublication(id: string): Observable<InstitutionPublication> {
    return this.http.post<InstitutionPublication>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/publications/${id}/submit`, {});
  }
}
