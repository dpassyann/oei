import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionOpportunitiesApplicationService } from './institution-opportunities-application.service';
import {
  INSTITUTION_OPPORTUNITIES_PORT,
  InstitutionOpportunitiesPort,
} from '../../domain/port/institution/institution-opportunities.port';
import { DEMO_OPPORTUNITIES } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionOpportunitiesApplicationService', () => {
  function setup(port: Partial<InstitutionOpportunitiesPort>) {
    TestBed.configureTestingModule({ providers: [{ provide: INSTITUTION_OPPORTUNITIES_PORT, useValue: port }] });
    return TestBed.inject(InstitutionOpportunitiesApplicationService);
  }

  it('whenListOpportunities_thenDelegatesToPort', async () => {
    const service = setup({ listOpportunities: () => of([...DEMO_OPPORTUNITIES]) });
    const opportunities = await firstValueFrom(service.listOpportunities());
    expect(opportunities).toEqual(DEMO_OPPORTUNITIES);
  });

  it('whenCreateOpportunity_thenForwardsCreationToPort', async () => {
    let received: unknown;
    const service = setup({
      createOpportunity: (creation) => {
        received = creation;
        return of(DEMO_OPPORTUNITIES[0]);
      },
    });
    await firstValueFrom(service.createOpportunity({ type: 'JOB', title: 'Titre', description: 'Description', expiresAt: null }));
    expect(received).toEqual({ type: 'JOB', title: 'Titre', description: 'Description', expiresAt: null });
  });
});
