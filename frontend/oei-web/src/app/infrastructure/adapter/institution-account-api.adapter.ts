import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionAccountPort } from '../../domain/port/institution/institution-account.port';
import { Institution } from '../../domain/model/institution/institution';
import { Partnership } from '../../domain/model/institution/partnership';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) is used.
@Service()
export class InstitutionAccountApiAdapter implements InstitutionAccountPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getMyInstitution(): Observable<Institution> {
    return this.http.get<Institution>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/account`);
  }

  updateMyInstitution(institution: Institution): Observable<Institution> {
    return this.http.put<Institution>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/account`, institution);
  }

  getMyPartnership(): Observable<Partnership> {
    return this.http.get<Partnership>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/partnership`);
  }
}
