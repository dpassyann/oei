import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionInvitationsApplicationService } from './institution-invitations-application.service';
import { INSTITUTION_INVITATIONS_PORT, InstitutionInvitationsPort } from '../../domain/port/institution/institution-invitations.port';
import { DEMO_INVITATIONS } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionInvitationsApplicationService', () => {
  function setup(port: Partial<InstitutionInvitationsPort>) {
    TestBed.configureTestingModule({ providers: [{ provide: INSTITUTION_INVITATIONS_PORT, useValue: port }] });
    return TestBed.inject(InstitutionInvitationsApplicationService);
  }

  it('whenListInvitations_thenDelegatesToPort', async () => {
    const service = setup({ listInvitations: () => of([...DEMO_INVITATIONS]) });
    const invitations = await firstValueFrom(service.listInvitations());
    expect(invitations).toEqual(DEMO_INVITATIONS);
  });

  it('whenCreateInvitation_thenForwardsCreationToPort', async () => {
    let received: unknown;
    const service = setup({
      createInvitation: (creation) => {
        received = creation;
        return of(DEMO_INVITATIONS[0]);
      },
    });
    await firstValueFrom(service.createInvitation({ email: 'x@oei-demo-institution.org', role: 'READER' }));
    expect(received).toEqual({ email: 'x@oei-demo-institution.org', role: 'READER' });
  });
});
