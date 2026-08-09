import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminDashboardKpis, AdminDashboardPort } from '../../domain/port/admin/admin-dashboard.port';

// Static-but-credible demo figures (task brief: "KPI ... static-but-credible mock KPIs"), kept
// deliberately round and plausible for a young association rather than either zero or a huge
// vanity number — consistent with the project's demo-data honesty rule (never presented as real
// OEI figures anywhere in the UI copy).
const DEMO_KPIS: AdminDashboardKpis = {
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
export class AdminDashboardMockAdapter implements AdminDashboardPort {
  getKpis(): Observable<AdminDashboardKpis> {
    return of(DEMO_KPIS);
  }
}
