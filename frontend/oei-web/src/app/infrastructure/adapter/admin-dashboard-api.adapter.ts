import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminDashboardKpis, AdminDashboardPort } from '../../domain/port/admin/admin-dashboard.port';

// GAP: per this task's brief, dashboard KPIs are UI-mock only — `openapi/oei-api.yaml` does not
// (and per the brief should not yet) expose a generic KPI/aggregation endpoint. Until a real
// Spring Boot backend adds one (e.g. `GET /api/admin/v1/dashboard/kpis`, aggregating counts
// across members/institutions/content/events), this "api" adapter intentionally returns the same
// static figures as `AdminDashboardMockAdapter` rather than calling a non-existent endpoint. Swap
// this for a real `HttpClient` call once that endpoint exists.
const PLACEHOLDER_KPIS: AdminDashboardKpis = {
  activeMembers: 128,
  expiredDues: 14,
  institutions: 9,
  pendingPublications: 3,
  events: 2,
  reports: 1,
  emails: 342,
  errors: 0,
};

@Service()
export class AdminDashboardApiAdapter implements AdminDashboardPort {
  getKpis(): Observable<AdminDashboardKpis> {
    return of(PLACEHOLDER_KPIS);
  }
}
