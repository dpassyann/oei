import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { AdminHomeBlocksApplicationService } from './admin-home-blocks-application.service';
import { ADMIN_HOME_BLOCKS_PORT } from '../../domain/port/admin/admin-home-blocks.port';
import { createHomeBlockConfig } from '../../domain/model/admin/admin-home-block';

describe('AdminHomeBlocksApplicationService', () => {
  function createService(portOverrides: Partial<Record<string, unknown>> = {}): AdminHomeBlocksApplicationService {
    TestBed.configureTestingModule({
      providers: [
        AdminHomeBlocksApplicationService,
        {
          provide: ADMIN_HOME_BLOCKS_PORT,
          useValue: { list: () => of([]), update: () => of(createHomeBlockConfig({ id: 'x', key: 'hero' })), reorder: () => of([]), ...portOverrides },
        },
      ],
    });
    return TestBed.inject(AdminHomeBlocksApplicationService);
  }

  it('givenUnsortedBlocks_whenList_thenReturnsAscendingByOrder', async () => {
    const service = createService({
      list: () =>
        of([
          createHomeBlockConfig({ id: 'b', key: 'stats', order: 2 }),
          createHomeBlockConfig({ id: 'a', key: 'hero', order: 1 }),
        ]),
    });
    const blocks = await firstValueFrom(service.list());
    expect(blocks.map((block) => block.id)).toEqual(['a', 'b']);
  });

  it('givenSecondBlock_whenMoveUp_thenSwapsOrderWithFirst', async () => {
    let reorderedId = '';
    let reorderedOrder = -1;
    const service = createService({
      reorder: (id: string, order: number) => {
        reorderedId = id;
        reorderedOrder = order;
        return of([]);
      },
    });
    const blocks = [
      createHomeBlockConfig({ id: 'a', key: 'hero', order: 1 }),
      createHomeBlockConfig({ id: 'b', key: 'stats', order: 2 }),
    ];
    const result = await firstValueFrom(service.move(blocks, blocks[1], 'up'));
    expect(reorderedId).toBe('b');
    expect(reorderedOrder).toBe(1);
    expect(result.find((block) => block.id === 'a')?.order).toBe(2);
    expect(result.find((block) => block.id === 'b')?.order).toBe(1);
  });

  it('givenFirstBlock_whenMoveUp_thenNoOpBecauseNoNeighbourAbove', async () => {
    const service = createService({ list: () => of([createHomeBlockConfig({ id: 'a', key: 'hero', order: 1 })]) });
    const blocks = [createHomeBlockConfig({ id: 'a', key: 'hero', order: 1 })];
    const result = await firstValueFrom(service.move(blocks, blocks[0], 'up'));
    expect(result.length).toBe(1);
  });
});
