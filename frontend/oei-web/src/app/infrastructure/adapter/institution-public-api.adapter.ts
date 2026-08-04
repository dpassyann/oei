import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionPublicPort } from '../../domain/port/institution/institution-public.port';
import { InstitutionPublicPage } from '../../domain/model/institution/institution-public-page';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionPublicApiAdapter implements InstitutionPublicPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getPublicInstitution(slug: string): Observable<InstitutionPublicPage> {
    return this.http.get<InstitutionPublicPage>(`${this.runtimeConfig.apiBaseUrl()}/public/v1/institutions/${slug}`);
  }
}
