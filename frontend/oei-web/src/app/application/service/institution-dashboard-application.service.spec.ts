import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionDashboardApplicationService } from './institution-dashboard-application.service';
import { INSTITUTION_DASHBOARD_PORT } from '../../domain/port/institution/institution-dashboard.port';
import { DEMO_DASHBOARD } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionDashboardApplicationService', () => {
  it('whenGetDashboard_thenDelegatesToPort', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: INSTITUTION_DASHBOARD_PORT, useValue: { getDashboard: () => of(DEMO_DASHBOARD) } }],
    });
    const service = TestBed.inject(InstitutionDashboardApplicationService);
    const dashboard = await firstValueFrom(service.getDashboard());
    expect(dashboard).toEqual(DEMO_DASHBOARD);
  });
});
