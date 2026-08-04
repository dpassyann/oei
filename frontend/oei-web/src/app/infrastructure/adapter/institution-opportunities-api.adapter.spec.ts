import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionOpportunitiesApiAdapter } from './institution-opportunities-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_OPPORTUNITIES } from './institution-demo-data';

describe('InstitutionOpportunitiesApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionOpportunitiesApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        InstitutionOpportunitiesApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    return { adapter: TestBed.inject(InstitutionOpportunitiesApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenListOpportunities_thenCallsOpportunitiesEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listOpportunities());
    httpMock.expectOne('/api/institution/v1/opportunities').flush(DEMO_OPPORTUNITIES);
    await result;
    httpMock.verify();
  });

  it('whenCloseOpportunity_thenPostsToCloseEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.closeOpportunity('institution-opportunity-demo-1'));
    const req = httpMock.expectOne('/api/institution/v1/opportunities/institution-opportunity-demo-1/close');
    expect(req.request.method).toBe('POST');
    req.flush(DEMO_OPPORTUNITIES[0]);
    await result;
    httpMock.verify();
  });
});
