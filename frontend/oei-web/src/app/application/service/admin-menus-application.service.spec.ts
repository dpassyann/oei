import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { AdminMenusApplicationService } from './admin-menus-application.service';
import { ADMIN_MENUS_PORT } from '../../domain/port/admin/admin-menus.port';
import { createMenuEntry, MenuEntry } from '../../domain/model/admin/admin-menu-entry';

describe('AdminMenusApplicationService', () => {
  function createService(portOverrides: Partial<Record<string, unknown>> = {}): AdminMenusApplicationService {
    TestBed.configureTestingModule({
      providers: [
        AdminMenusApplicationService,
        {
          provide: ADMIN_MENUS_PORT,
          useValue: {
            list: () => of([]),
            create: () => of(createMenuEntry({ id: 'new' })),
            update: () => of(createMenuEntry({ id: 'updated' })),
            setActive: () => of(createMenuEntry({ id: 'x', active: false })),
            reorder: () => of([]),
            ...portOverrides,
          },
        },
      ],
    });
    return TestBed.inject(AdminMenusApplicationService);
  }

  it('givenRouteWithoutLeadingSlash_whenValidate_thenInvalid', () => {
    const service = createService();
    const result = service.validate({ labelKey: 'nav.home', route: 'home', zone: 'header' });
    expect(result.valid).toBe(false);
    expect(result.routeError).toBe(true);
  });

  it('givenEmptyLabelKey_whenValidate_thenInvalid', () => {
    const service = createService();
    const result = service.validate({ labelKey: '  ', route: '/home', zone: 'header' });
    expect(result.valid).toBe(false);
    expect(result.labelKeyError).toBe(true);
  });

  it('givenValidInput_whenValidate_thenValid', () => {
    const service = createService();
    const result = service.validate({ labelKey: 'nav.home', route: '/home', zone: 'header' });
    expect(result.valid).toBe(true);
  });

  it('givenTwoZoneEntries_whenSortByZone_thenAscendingOrderForThatZoneOnly', () => {
    const service = createService();
    const entries: MenuEntry[] = [
      createMenuEntry({ id: 'a', zone: 'header', order: 2 }),
      createMenuEntry({ id: 'b', zone: 'header', order: 1 }),
      createMenuEntry({ id: 'c', zone: 'footer', order: 1 }),
    ];
    const sorted = service.sortByZone(entries, 'header');
    expect(sorted.map((entry) => entry.id)).toEqual(['b', 'a']);
  });

  it('givenMiddleEntry_whenMoveUp_thenReorderCalledWithNeighbourOrder', async () => {
    let reorderedId = '';
    let reorderedOrder = -1;
    const service = createService({
      reorder: (id: string, order: number) => {
        reorderedId = id;
        reorderedOrder = order;
        return of([]);
      },
    });
    const entries: MenuEntry[] = [
      createMenuEntry({ id: 'a', zone: 'header', order: 1 }),
      createMenuEntry({ id: 'b', zone: 'header', order: 2 }),
    ];
    await firstValueFrom(service.move(entries, entries[1], 'up'));
    expect(reorderedId).toBe('b');
    expect(reorderedOrder).toBe(1);
  });
});
