import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AdminInstitutionDetail } from './admin-institution-detail';
import { AdminInstitutionsApplicationService } from '../../../../application/service/admin-institutions-application.service';
import { createInstitution } from '../../../../domain/model/institution/institution';
import { availableActions } from '../../../../domain/model/institution/institution-workflow';

function institutionWith(status: string) {
  return createInstitution({
    id: 'inst-1',
    legalName: 'Institution Un SA',
    publicName: 'Institution Un',
    logoUrl: '',
    country: 'CH',
    sectors: [],
    description: 'Exemple.',
    emailDomains: [],
    publicSlug: 'institution-un',
    isDemoData: true,
    status: status as never,
  });
}

describe('AdminInstitutionDetail', () => {
  function setUp(institution: ReturnType<typeof institutionWith>, extraProviders: unknown[] = []) {
    TestBed.configureTestingModule({
      imports: [AdminInstitutionDetail],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: institution.id })) } },
        {
          provide: AdminInstitutionsApplicationService,
          useValue: {
            getById: () => of(institution),
            availableActions: (inst: { status?: string }) => availableActions((inst.status ?? 'ACTIVE') as never),
            approve: () => of(institution),
            activate: () => of(institution),
            suspend: () => of(institution),
            revoke: () => of(institution),
          },
        },
        ...extraProviders,
      ],
    });
    const fixture = TestBed.createComponent(AdminInstitutionDetail);
    fixture.detectChanges();
    return fixture;
  }

  it('givenDocumentsPendingInstitution_whenCreated_thenShowsApproveButtonOnly', async () => {
    const fixture = setUp(institutionWith('DOCUMENTS_PENDING'));
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.oei-admin-institution-detail__actions button')).map(
      (button) => button.textContent?.trim(),
    );
    expect(buttons.length).toBe(1);
  });

  it('givenActiveInstitution_whenRevokeClickedWithoutReason_thenShowsValidationError', async () => {
    const fixture = setUp(institutionWith('ACTIVE'));
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const revokeButton = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.oei-admin-institution-detail__actions button')).find((button) =>
      button.textContent?.toLowerCase().includes('révoq') || button.textContent?.toLowerCase().includes('revoke'),
    );
    revokeButton?.click();
    fixture.detectChanges();

    compiled.querySelector('.oei-admin-institution-detail__revoke-form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.querySelector('.oei-admin-institution-detail__error')).toBeTruthy();
  });
});
