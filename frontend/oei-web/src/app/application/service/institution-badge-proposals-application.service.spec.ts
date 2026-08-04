import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionBadgeProposalsApplicationService } from './institution-badge-proposals-application.service';
import { INSTITUTION_BADGE_PROPOSALS_PORT } from '../../domain/port/institution/institution-badge-proposals.port';
import { DEMO_BADGE_PROPOSALS } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionBadgeProposalsApplicationService', () => {
  it('whenListBadgeProposals_thenDelegatesToPort', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: INSTITUTION_BADGE_PROPOSALS_PORT, useValue: { listBadgeProposals: () => of([...DEMO_BADGE_PROPOSALS]) } }],
    });
    const service = TestBed.inject(InstitutionBadgeProposalsApplicationService);
    const proposals = await firstValueFrom(service.listBadgeProposals());
    expect(proposals).toEqual(DEMO_BADGE_PROPOSALS);
  });
});
