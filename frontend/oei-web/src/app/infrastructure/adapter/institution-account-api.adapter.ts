import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionAccountPort } from '../../domain/port/institution/institution-account.port';
import { Institution } from '../../domain/model/institution/institution';
import { Partnership } from '../../domain/model/institution/partnership';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) is used.
@Service()
export class InstitutionAccountApiAdapter implements InstitutionAccountPort {
  private readonly http = inject(HttpClient);

  getMyInstitution(): Observable<Institution> {
    return this.http.get<Institution>(`${INSTITUTION_API_BASE}/account`);
  }

  updateMyInstitution(institution: Institution): Observable<Institution> {
    return this.http.put<Institution>(`${INSTITUTION_API_BASE}/account`, institution);
  }

  getMyPartnership(): Observable<Partnership> {
    return this.http.get<Partnership>(`${INSTITUTION_API_BASE}/partnership`);
  }
}
