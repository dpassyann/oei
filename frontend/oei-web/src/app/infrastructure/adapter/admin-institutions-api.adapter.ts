import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminInstitutionCreationInput, AdminInstitutionsPort } from '../../domain/port/admin/admin-institutions.port';
import { Institution } from '../../domain/model/institution/institution';

// Matches `/api/admin/v1/institutions/**` in `openapi/oei-api.yaml`. Note: `getById` calls a plain
// `GET /api/admin/v1/institutions/{id}` which has no dedicated operation in the contract today
// (only `GET /institutions` (list), `POST /institutions` (create) and the `{id}/approve`,
// `{id}/activate`, `{id}/suspend`, `{id}/revoke` transitions are defined) — kept as-is pending a
// contract addition, per this audit's scope (fix drifted paths/fields, not invent endpoints).
//
// Endpoints under `/api/admin/v1/**` are role-versioned per ADR 0002 and use a literal prefix
// rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1` public-site
// base and is only overridable for that historical `home-legacy` family of endpoints).
const ADMIN_INSTITUTIONS_API_BASE = '/api/admin/v1/institutions';

@Service()
export class AdminInstitutionsApiAdapter implements AdminInstitutionsPort {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return ADMIN_INSTITUTIONS_API_BASE;
  }

  list(): Observable<Institution[]> {
    return this.http.get<Institution[]>(this.baseUrl);
  }

  getById(id: string): Observable<Institution> {
    return this.http.get<Institution>(`${this.baseUrl}/${id}`);
  }

  create(input: AdminInstitutionCreationInput): Observable<Institution> {
    return this.http.post<Institution>(this.baseUrl, input);
  }

  approve(id: string): Observable<Institution> {
    return this.http.post<Institution>(`${this.baseUrl}/${id}/approve`, {});
  }

  /**
   * Calls the pure `activate` transition endpoint only. The real Keycloak provisioning chain
   * (create institution admin user via Keycloak Admin API, activation email, institutional role
   * assignment, `institutionId` association, forced password change, audit log — see
   * `activateInstitution`'s OpenAPI doc comment) is expected to run entirely server-side, behind
   * this same endpoint, once a real Spring Boot backend implements it. This frontend never talks
   * to Keycloak's Admin API directly.
   */
  activate(id: string): Observable<Institution> {
    return this.http.post<Institution>(`${this.baseUrl}/${id}/activate`, {});
  }

  suspend(id: string, reason?: string): Observable<Institution> {
    return this.http.post<Institution>(`${this.baseUrl}/${id}/suspend`, reason ? { reason } : {});
  }

  revoke(id: string, reason: string): Observable<Institution> {
    return this.http.post<Institution>(`${this.baseUrl}/${id}/revoke`, { reason });
  }
}
