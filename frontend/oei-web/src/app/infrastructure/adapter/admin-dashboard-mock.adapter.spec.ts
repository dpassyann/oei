import { firstValueFrom } from 'rxjs';
import { AdminDashboardMockAdapter } from './admin-dashboard-mock.adapter';

describe('AdminDashboardMockAdapter', () => {
  it('whenGetKpis_thenReturnsCredibleStaticFigures', async () => {
    const adapter = new AdminDashboardMockAdapter();
    const kpis = await firstValueFrom(adapter.getKpis());
    expect(kpis.activeMembers).toBeGreaterThan(0);
    expect(kpis.errors).toBe(0);
    expect(Object.values(kpis).every((value) => typeof value === 'number' && value >= 0)).toBe(true);
  });
});
