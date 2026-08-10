import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MemberCertificationGoalApiAdapter } from './member-certification-goal-api.adapter';

describe('MemberCertificationGoalApiAdapter', () => {
  function createAdapter(): { adapter: MemberCertificationGoalApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [MemberCertificationGoalApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      adapter: TestBed.inject(MemberCertificationGoalApiAdapter),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  it('givenBackendReturnsGoals_whenListMyCertificationGoals_thenCallsCertificationGoalsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listMyCertificationGoals());
    const req = httpMock.expectOne('/api/member/v1/certification-goals');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(await result).toEqual([]);
    httpMock.verify();
  });

  it('givenUpsert_whenUpsertMyCertificationGoal_thenPostsBodyToCertificationGoalsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const upsert = { recognizedCertificationId: 'rc-1', status: 'PLANNED' as const };
    const result = firstValueFrom(adapter.upsertMyCertificationGoal(upsert));
    const req = httpMock.expectOne('/api/member/v1/certification-goals');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(upsert);
    req.flush({ id: 'goal-1', memberId: 'demo-member-1', ...upsert, createdAt: 'now', updatedAt: 'now' });
    expect((await result).status).toBe('PLANNED');
    httpMock.verify();
  });
});
