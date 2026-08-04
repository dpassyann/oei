import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionBadgeProposalsApiAdapter } from './institution-badge-proposals-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_BADGE_PROPOSALS } from './institution-demo-data';

describe('InstitutionBadgeProposalsApiAdapter', () => {
  it('whenListBadgeProposals_thenCallsBadgeProposalsEndpoint', async () => {
    TestBed.configureTestingModule({
      providers: [
        InstitutionBadgeProposalsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    const adapter = TestBed.inject(InstitutionBadgeProposalsApiAdapter);
    const httpMock = TestBed.inject(HttpTestingController);
    const result = firstValueFrom(adapter.listBadgeProposals());
    httpMock.expectOne('/api/institution/v1/badge-proposals').flush(DEMO_BADGE_PROPOSALS);
    await result;
    httpMock.verify();
  });
});
