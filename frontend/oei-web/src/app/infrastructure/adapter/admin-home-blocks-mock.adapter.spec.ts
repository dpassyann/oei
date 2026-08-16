import { firstValueFrom } from 'rxjs';
import { AdminHomeBlocksMockAdapter, resetAdminHomeBlocksFixtures } from './admin-home-blocks-mock.adapter';

describe('AdminHomeBlocksMockAdapter', () => {
  beforeEach(() => resetAdminHomeBlocksFixtures());

  it('whenList_thenReturnsSixSeedBlocks', async () => {
    const adapter = new AdminHomeBlocksMockAdapter();
    const blocks = await firstValueFrom(adapter.list());
    expect(blocks.length).toBe(6);
    expect(blocks.some((block) => block.key === 'hero')).toBe(true);
  });

  it('givenBlock_whenUpdate_thenLabelAndActiveChange', async () => {
    const adapter = new AdminHomeBlocksMockAdapter();
    const updated = await firstValueFrom(adapter.update('block-stats', { label: 'Chiffres clés', active: false }));
    expect(updated.label).toBe('Chiffres clés');
    expect(updated.active).toBe(false);
  });

  it('givenUnknownId_whenUpdate_thenThrows', async () => {
    const adapter = new AdminHomeBlocksMockAdapter();
    await expect(firstValueFrom(adapter.update('missing', { label: 'x', active: true }))).rejects.toThrow();
  });
});
