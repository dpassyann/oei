import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { AdminDashboardApplicationService } from '../../../../application/service/admin-dashboard-application.service';

describe('AdminDashboard', () => {
  it('givenKpis_whenCreated_thenRendersEightTiles', async () => {
    TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideRouter([]),
        {
          provide: AdminDashboardApplicationService,
          useValue: {
            getKpis: () =>
              of({
                activeMembers: 128,
                expiredDues: 14,
                institutions: 9,
                pendingPublications: 3,
                events: 2,
                reports: 1,
                emails: 342,
                errors: 0,
              }),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminDashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tiles = (fixture.nativeElement as HTMLElement).querySelectorAll('.oei-admin-dashboard__tile');
    expect(tiles.length).toBe(8);
  });
});
