import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminInstitutionsList } from './admin-institutions-list';
import { AdminInstitutionsApplicationService } from '../../../../application/service/admin-institutions-application.service';
import { createInstitution } from '../../../../domain/model/institution/institution';

describe('AdminInstitutionsList', () => {
  it('givenInstitutions_whenCreated_thenRendersOneRowPerInstitution', async () => {
    TestBed.configureTestingModule({
      imports: [AdminInstitutionsList],
      providers: [
        provideRouter([]),
        {
          provide: AdminInstitutionsApplicationService,
          useValue: {
            list: () =>
              of([
                createInstitution({
                  id: 'inst-1',
                  legalName: 'Institution Un SA (exemple)',
                  publicName: 'Institution Un',
                  logoUrl: '',
                  country: 'CH',
                  sectors: [],
                  description: '',
                  emailDomains: [],
                  publicSlug: 'institution-un',
                  isDemoData: true,
                  status: 'ACTIVE',
                }),
              ]),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminInstitutionsList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });
});
