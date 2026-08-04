import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionAffiliationsApplicationService } from './institution-affiliations-application.service';
import { INSTITUTION_AFFILIATIONS_PORT, InstitutionAffiliationsPort } from '../../domain/port/institution/institution-affiliations.port';
import { DEMO_AFFILIATIONS } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionAffiliationsApplicationService', () => {
  function setup(port: Partial<InstitutionAffiliationsPort>) {
    TestBed.configureTestingModule({ providers: [{ provide: INSTITUTION_AFFILIATIONS_PORT, useValue: port }] });
    return TestBed.inject(InstitutionAffiliationsApplicationService);
  }

  it('whenListMembers_thenDelegatesToPort', async () => {
    const service = setup({ listMembers: () => of([...DEMO_AFFILIATIONS]) });
    const members = await firstValueFrom(service.listMembers());
    expect(members).toEqual(DEMO_AFFILIATIONS);
  });

  it('whenApproveAffiliation_thenForwardsIdToPort', async () => {
    let received: unknown;
    const service = setup({
      approveAffiliation: (id) => {
        received = id;
        return of(DEMO_AFFILIATIONS[0]);
      },
    });
    await firstValueFrom(service.approveAffiliation('affiliation-demo-2'));
    expect(received).toBe('affiliation-demo-2');
  });
});
