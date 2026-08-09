import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

// `.prompt/plan/final/03-ADMIN-CONSOLE.md` §Dashboard: "membres actifs, cotisations expirées,
// institutions, publications à valider, événements, signalements, emails, erreurs et activités
// sensibles". Per this task's brief, these KPIs are intentionally UI-mock only — no aggregation
// endpoint exists (or should be added) in `openapi/oei-api.yaml` for them yet; see
// `AdminDashboardApiAdapter`'s doc comment.
export interface AdminDashboardKpis {
  readonly activeMembers: number;
  readonly expiredDues: number;
  readonly institutions: number;
  readonly pendingPublications: number;
  readonly events: number;
  readonly reports: number;
  readonly emails: number;
  readonly errors: number;
}

export interface AdminDashboardPort {
  getKpis(): Observable<AdminDashboardKpis>;
}

export const ADMIN_DASHBOARD_PORT = new InjectionToken<AdminDashboardPort>('AdminDashboardPort');
