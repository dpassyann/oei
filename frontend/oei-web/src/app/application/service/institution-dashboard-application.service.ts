import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_DASHBOARD_PORT } from '../../domain/port/institution/institution-dashboard.port';
import { InstitutionDashboard } from '../../domain/model/institution/institution-dashboard';

@Service()
export class InstitutionDashboardApplicationService {
  private readonly port = inject(INSTITUTION_DASHBOARD_PORT);

  getDashboard(): Observable<InstitutionDashboard> {
    return this.port.getDashboard();
  }
}
