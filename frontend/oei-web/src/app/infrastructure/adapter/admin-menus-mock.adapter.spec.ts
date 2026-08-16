import { firstValueFrom } from 'rxjs';
import { AdminMenusMockAdapter, resetAdminMenusFixtures } from './admin-menus-mock.adapter';

describe('AdminMenusMockAdapter', () => {
  beforeEach(() => resetAdminMenusFixtures());

  it('whenList_thenReturnsSeedEntries', async () => {
    const adapter = new AdminMenusMockAdapter();
    const entries = await firstValueFrom(adapter.list());
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((entry) => entry.zone === 'footer')).toBe(true);
  });

  it('givenNewEntry_whenCreate_thenAppendedWithNextOrderInItsZone', async () => {
    const adapter = new AdminMenusMockAdapter();
    const created = await firstValueFrom(adapter.create({ labelKey: 'nav.demo', route: '/demo', zone: 'header' }));
    expect(created.order).toBeGreaterThan(0);
    const entries = await firstValueFrom(adapter.list());
    expect(entries.find((entry) => entry.id === created.id)).toBeTruthy();
  });

  it('givenEntry_whenSetActiveFalse_thenSoftDeletedNotRemoved', async () => {
    const adapter = new AdminMenusMockAdapter();
    const updated = await firstValueFrom(adapter.setActive('menu-home', false));
    expect(updated.active).toBe(false);
    const entries = await firstValueFrom(adapter.list());
    expect(entries.find((entry) => entry.id === 'menu-home')).toBeTruthy();
  });

  it('givenUnknownId_whenUpdate_thenThrows', async () => {
    const adapter = new AdminMenusMockAdapter();
    await expect(firstValueFrom(adapter.update('missing', { labelKey: 'x', route: '/x', zone: 'header' }))).rejects.toThrow();
  });
});
