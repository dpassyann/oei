import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminInstitutionCreationInput, AdminInstitutionsPort } from '../../domain/port/admin/admin-institutions.port';
import { Institution } from '../../domain/model/institution/institution';
import { RuntimeConfig } from '../config/runtime-config';

// Matches `/api/admin/v1/institutions/**` in `openapi/oei-api.yaml`.
@Service()
export class AdminInstitutionsApiAdapter implements AdminInstitutionsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  private get baseUrl(): string {
    return `${this.runtimeConfig.apiBaseUrl()}/admin/v1/institutions`;
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
