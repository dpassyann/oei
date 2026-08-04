import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { InstitutionMembers } from './membres';
import { InstitutionAffiliationsApplicationService } from '../../../../application/service/institution-affiliations-application.service';
import { InstitutionInvitationsApplicationService } from '../../../../application/service/institution-invitations-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { DEMO_AFFILIATIONS, DEMO_INVITATIONS } from '../../../../infrastructure/adapter/institution-demo-data';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceInstitution.nav.backToDashboard': 'Retour au tableau de bord',
  'espaceInstitution.members.title': 'Membres affiliés',
  'espaceInstitution.members.intro': 'Intro',
  'espaceInstitution.members.listTitle': 'Membres affiliés actifs',
  'espaceInstitution.members.empty': 'Aucun membre affilié pour le moment.',
  'espaceInstitution.members.requestsTitle': 'Demandes',
  'espaceInstitution.members.requestsEmpty': 'Aucune demande.',
  'espaceInstitution.members.approve': 'Approuver',
  'espaceInstitution.members.reject': 'Rejeter',
  'espaceInstitution.members.endAffiliation': "Mettre fin à l'affiliation",
  'espaceInstitution.members.inviteTitle': 'Inviter',
  'espaceInstitution.members.inviteEmailLabel': 'Email',
  'espaceInstitution.members.inviteRoleLabel': 'Rôle',
  'espaceInstitution.members.inviteSubmit': "Envoyer l'invitation",
  'espaceInstitution.members.status.PENDING': 'En attente',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

describe('InstitutionMembers', () => {
  function configure(overrides: { members?: typeof DEMO_AFFILIATIONS; requests?: typeof DEMO_AFFILIATIONS } = {}) {
    const approve = vi.fn(() => of(DEMO_AFFILIATIONS[1]));
    TestBed.configureTestingModule({
      imports: [InstitutionMembers],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: InstitutionAffiliationsApplicationService,
          useValue: {
            listMembers: () => of(overrides.members ?? []),
            listAffiliationRequests: () => of(overrides.requests ?? DEMO_AFFILIATIONS),
            approveAffiliation: approve,
            rejectAffiliation: () => of(DEMO_AFFILIATIONS[1]),
            endAffiliation: () => of(undefined),
          },
        },
        {
          provide: InstitutionInvitationsApplicationService,
          useValue: { listInvitations: () => of([...DEMO_INVITATIONS]), createInvitation: () => of(DEMO_INVITATIONS[0]), revokeInvitation: () => of(DEMO_INVITATIONS[0]) },
        },
      ],
    });
    return { approve };
  }

  it('givenNoMembers_whenCreated_thenRendersHonestEmptyState', async () => {
    configure({ members: [] });
    const fixture = TestBed.createComponent(InstitutionMembers);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.oei-institution-members__section')[0].querySelector('.oei-page__empty')).toBeTruthy();
  });

  it('givenPendingRequest_whenApproveClicked_thenCallsApproveAffiliationWithId', async () => {
    const { approve } = configure({ requests: [DEMO_AFFILIATIONS[1]] });
    const fixture = TestBed.createComponent(InstitutionMembers);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const approveButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent === 'Approuver');
    approveButton?.dispatchEvent(new Event('click'));
    expect(approve).toHaveBeenCalledWith('affiliation-demo-2');
  });
});
