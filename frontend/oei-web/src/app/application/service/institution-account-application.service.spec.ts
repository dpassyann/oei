import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionAccountApplicationService } from './institution-account-application.service';
import { INSTITUTION_ACCOUNT_PORT, InstitutionAccountPort } from '../../domain/port/institution/institution-account.port';
import { DEMO_INSTITUTION, DEMO_PARTNERSHIP } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionAccountApplicationService', () => {
  function setup(port: Partial<InstitutionAccountPort>) {
    TestBed.configureTestingModule({ providers: [{ provide: INSTITUTION_ACCOUNT_PORT, useValue: port }] });
    return TestBed.inject(InstitutionAccountApplicationService);
  }

  it('whenGetMyInstitution_thenDelegatesToPort', async () => {
    const service = setup({ getMyInstitution: () => of(DEMO_INSTITUTION) });
    const institution = await firstValueFrom(service.getMyInstitution());
    expect(institution).toEqual(DEMO_INSTITUTION);
  });

  it('whenGetMyPartnership_thenDelegatesToPort', async () => {
    const service = setup({ getMyPartnership: () => of(DEMO_PARTNERSHIP) });
    const partnership = await firstValueFrom(service.getMyPartnership());
    expect(partnership).toEqual(DEMO_PARTNERSHIP);
  });

  it('whenUpdateMyInstitution_thenForwardsInstitutionToPort', async () => {
    let received: unknown;
    const service = setup({
      updateMyInstitution: (institution) => {
        received = institution;
        return of(institution);
      },
    });
    await firstValueFrom(service.updateMyInstitution(DEMO_INSTITUTION));
    expect(received).toEqual(DEMO_INSTITUTION);
  });
});
