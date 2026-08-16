import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminMenus } from './admin-menus';
import { AdminMenusApplicationService } from '../../../../application/service/admin-menus-application.service';
import { createMenuEntry } from '../../../../domain/model/admin/admin-menu-entry';

describe('AdminMenus', () => {
  it('givenEntries_whenCreated_thenRendersHeaderAndFooterRows', async () => {
    const entries = [
      createMenuEntry({ id: 'menu-home', labelKey: 'nav.home', route: '/', zone: 'header', order: 1 }),
      createMenuEntry({ id: 'menu-legal', labelKey: 'nav.legalNotices', route: '/mentions-legales', zone: 'footer', order: 1 }),
    ];

    TestBed.configureTestingModule({
      imports: [AdminMenus],
      providers: [
        {
          provide: AdminMenusApplicationService,
          useValue: {
            list: () => of(entries),
            sortByZone: (list: typeof entries, zone: string) => list.filter((entry) => entry.zone === zone),
            validate: () => ({ valid: true, labelKeyError: false, routeError: false }),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminMenus);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });
});
