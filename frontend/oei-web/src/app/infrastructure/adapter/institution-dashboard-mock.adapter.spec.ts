import { firstValueFrom } from 'rxjs';
import { InstitutionDashboardMockAdapter } from './institution-dashboard-mock.adapter';

describe('InstitutionDashboardMockAdapter', () => {
  it('whenGetDashboard_thenReturnsHonestDemoKpisWithInProgressMaturity', async () => {
    const adapter = new InstitutionDashboardMockAdapter();
    const dashboard = await firstValueFrom(adapter.getDashboard());
    expect(dashboard.institutionId).toBe('inst-demo-institution');
    expect(dashboard.certifications).toBe(0);
    expect(dashboard.badges).toBe(0);
    expect(dashboard.dataMaturity).toBe('IN_PROGRESS');
  });
});
