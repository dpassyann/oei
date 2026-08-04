import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionAffiliationsApiAdapter } from './institution-affiliations-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_AFFILIATIONS } from './institution-demo-data';

describe('InstitutionAffiliationsApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionAffiliationsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        InstitutionAffiliationsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    return { adapter: TestBed.inject(InstitutionAffiliationsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenListMembers_thenCallsMembersEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listMembers());
    httpMock.expectOne('/api/institution/v1/members').flush(DEMO_AFFILIATIONS);
    await result;
    httpMock.verify();
  });

  it('whenApproveAffiliation_thenPostsToApproveEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.approveAffiliation('affiliation-demo-2'));
    const req = httpMock.expectOne('/api/institution/v1/affiliations/affiliation-demo-2/approve');
    expect(req.request.method).toBe('POST');
    req.flush(DEMO_AFFILIATIONS[1]);
    await result;
    httpMock.verify();
  });

  it('whenEndAffiliation_thenCallsDelete', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.endAffiliation('affiliation-demo-1'));
    const req = httpMock.expectOne('/api/institution/v1/affiliations/affiliation-demo-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await result;
    httpMock.verify();
  });
});
