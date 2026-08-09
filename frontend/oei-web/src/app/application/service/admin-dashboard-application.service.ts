import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ADMIN_DASHBOARD_PORT, AdminDashboardKpis } from '../../domain/port/admin/admin-dashboard.port';

@Service()
export class AdminDashboardApplicationService {
  private readonly port = inject(ADMIN_DASHBOARD_PORT);

  getKpis(): Observable<AdminDashboardKpis> {
    return this.port.getKpis();
  }
}
