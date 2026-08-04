import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionPublicationsApplicationService } from './institution-publications-application.service';
import {
  INSTITUTION_PUBLICATIONS_PORT,
  InstitutionPublicationsPort,
} from '../../domain/port/institution/institution-publications.port';
import { DEMO_PUBLICATIONS } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionPublicationsApplicationService', () => {
  function setup(port: Partial<InstitutionPublicationsPort>) {
    TestBed.configureTestingModule({ providers: [{ provide: INSTITUTION_PUBLICATIONS_PORT, useValue: port }] });
    return TestBed.inject(InstitutionPublicationsApplicationService);
  }

  it('whenListPublications_thenDelegatesToPort', async () => {
    const service = setup({ listPublications: () => of([...DEMO_PUBLICATIONS]) });
    const publications = await firstValueFrom(service.listPublications());
    expect(publications).toEqual(DEMO_PUBLICATIONS);
  });

  it('whenSubmitPublication_thenForwardsIdToPort', async () => {
    let received: unknown;
    const service = setup({
      submitPublication: (id) => {
        received = id;
        return of(DEMO_PUBLICATIONS[0]);
      },
    });
    await firstValueFrom(service.submitPublication('institution-publication-demo-2'));
    expect(received).toBe('institution-publication-demo-2');
  });
});
