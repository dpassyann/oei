import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AdminInstitutionNew } from './admin-institution-new';
import { AdminInstitutionsApplicationService } from '../../../../application/service/admin-institutions-application.service';
import { createInstitution } from '../../../../domain/model/institution/institution';

describe('AdminInstitutionNew', () => {
  it('givenMissingRequiredFields_whenSubmitted_thenShowsValidationErrorWithoutCallingService', () => {
    const createSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [AdminInstitutionNew],
      providers: [provideRouter([]), { provide: AdminInstitutionsApplicationService, useValue: { create: createSpy } }],
    });
    const fixture = TestBed.createComponent(AdminInstitutionNew);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(createSpy).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).querySelector('.oei-admin-institution-new__error')).toBeTruthy();
  });

  it('givenValidDraft_whenSubmitted_thenCreatesAndNavigatesToDetail', async () => {
    const created = createInstitution({
      id: 'inst-new-1',
      legalName: 'Nouvelle Institution SA',
      publicName: 'Nouvelle Institution',
      logoUrl: '',
      country: 'CH',
      sectors: [],
      description: '',
      emailDomains: [],
      publicSlug: 'nouvelle-institution',
      isDemoData: true,
      status: 'DRAFT',
    });
    TestBed.configureTestingModule({
      imports: [AdminInstitutionNew],
      providers: [provideRouter([]), { provide: AdminInstitutionsApplicationService, useValue: { create: () => of(created) } }],
    });
    const fixture = TestBed.createComponent(AdminInstitutionNew);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component['updateDraft']({
      legalName: 'Nouvelle Institution SA',
      publicName: 'Nouvelle Institution',
      country: 'CH',
      institutionAdminEmail: 'admin@nouvelle-institution.example',
    });
    component['submit']();

    expect(navigateSpy).toHaveBeenCalledWith(['/admin/institutions', 'inst-new-1']);
  });

  it('givenServiceError_whenSubmitted_thenShowsSubmitError', () => {
    TestBed.configureTestingModule({
      imports: [AdminInstitutionNew],
      providers: [
        provideRouter([]),
        { provide: AdminInstitutionsApplicationService, useValue: { create: () => throwError(() => new Error('boom')) } },
      ],
    });
    const fixture = TestBed.createComponent(AdminInstitutionNew);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['updateDraft']({
      legalName: 'Nouvelle Institution SA',
      publicName: 'Nouvelle Institution',
      country: 'CH',
      institutionAdminEmail: 'admin@nouvelle-institution.example',
    });
    component['submit']();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.oei-admin-institution-new__error')?.textContent).toBeTruthy();
  });
});
