import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionBadgeProposalsApiAdapter } from './institution-badge-proposals-api.adapter';
import { DEMO_BADGE_PROPOSALS } from './institution-demo-data';

describe('InstitutionBadgeProposalsApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionBadgeProposalsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [InstitutionBadgeProposalsApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(InstitutionBadgeProposalsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenListBadgeProposals_thenCallsBadgeProposalsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listBadgeProposals());
    httpMock.expectOne('/api/institution/v1/badge-proposals').flush(DEMO_BADGE_PROPOSALS);
    await result;
    httpMock.verify();
  });

  it('whenCreateBadgeProposal_thenPostsCreationBody', async () => {
    const { adapter, httpMock } = createAdapter();
    const creation = { memberId: 'member-demo-1', proposedBadgeCode: 'internal-training-2026', justification: 'A suivi la formation.' };
    const result = firstValueFrom(adapter.createBadgeProposal(creation));
    const req = httpMock.expectOne('/api/institution/v1/badge-proposals');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creation);
    req.flush(DEMO_BADGE_PROPOSALS[0]);
    await result;
    httpMock.verify();
  });
});
