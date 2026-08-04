import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InstitutionDashboardPort } from '../../domain/port/institution/institution-dashboard.port';
import { InstitutionDashboard } from '../../domain/model/institution/institution-dashboard';
import { DEMO_DASHBOARD } from './institution-demo-data';

@Service()
export class InstitutionDashboardMockAdapter implements InstitutionDashboardPort {
  getDashboard(): Observable<InstitutionDashboard> {
    return of(DEMO_DASHBOARD);
  }
}
