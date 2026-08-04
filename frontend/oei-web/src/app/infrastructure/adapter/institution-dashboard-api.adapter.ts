import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionDashboardPort } from '../../domain/port/institution/institution-dashboard.port';
import { InstitutionDashboard } from '../../domain/model/institution/institution-dashboard';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionDashboardApiAdapter implements InstitutionDashboardPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getDashboard(): Observable<InstitutionDashboard> {
    return this.http.get<InstitutionDashboard>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/dashboard`);
  }
}
