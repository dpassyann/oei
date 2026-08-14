import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InstitutionDashboardPort } from '../../domain/port/institution/institution-dashboard.port';
import { InstitutionDashboard } from '../../domain/model/institution/institution-dashboard';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionDashboardApiAdapter implements InstitutionDashboardPort {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<InstitutionDashboard> {
    // The `InstitutionDashboard` OpenAPI schema has no `dataMaturity` field (the honesty-rule
    // maturity flag is a frontend-only concept — see the domain model's doc comment); since the
    // real counters are always genuine backend data once this endpoint responds, map to
    // `'ESTABLISHED'` rather than surfacing `undefined` to the dashboard template.
    return this.http
      .get<InstitutionDashboard>(`${INSTITUTION_API_BASE}/dashboard`)
      .pipe(map((dashboard) => ({ ...dashboard, dataMaturity: dashboard.dataMaturity ?? 'ESTABLISHED' })));
  }
}
