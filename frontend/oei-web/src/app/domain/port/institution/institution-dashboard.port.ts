import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionDashboard } from '../../model/institution/institution-dashboard';

// `GET /api/institution/v1/dashboard`.
export interface InstitutionDashboardPort {
  getDashboard(): Observable<InstitutionDashboard>;
}

export const INSTITUTION_DASHBOARD_PORT = new InjectionToken<InstitutionDashboardPort>('InstitutionDashboardPort');
