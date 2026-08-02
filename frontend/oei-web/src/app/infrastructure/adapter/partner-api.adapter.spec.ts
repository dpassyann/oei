import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PartnerApiAdapter } from './partner-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('PartnerApiAdapter', () => {
  let httpMock: HttpTestingController;

  function createAdapter(apiBaseUrl: string): PartnerApiAdapter {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PartnerApiAdapter,
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(PartnerApiAdapter);
  }

  afterEach(() => httpMock.verify());

  it('givenBackendReturnsPartners_whenGetPartners_thenMapsToDomainPartners', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.getPartners();
    const req = httpMock.expectOne('/api/v1/partners');
    req.flush([
      {
        id: 'p1',
        name: 'Partenaire Un',
        logoUrl: '/logo.png',
        description: 'Desc',
        websiteUrl: 'https://partner.example',
        category: 'Institution',
      },
    ]);
    const partners = await promise;
    expect(partners[0].id).toBe('p1');
  });

  it('givenNonDefaultApiBaseUrl_whenGetPartners_thenBuildsUrlFromRuntimeConfig', async () => {
    const adapter = createAdapter('/custom-api');
    const promise = adapter.getPartners();
    const req = httpMock.expectOne('/custom-api/partners');
    req.flush([]);
    await promise;
  });

  it('givenBackendReturnsPartner_whenGetPartner_thenBuildsUrlWithIdAndMapsResult', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.getPartner('p1');
    const req = httpMock.expectOne('/api/v1/partners/p1');
    req.flush({
      id: 'p1',
      name: 'Partenaire Un',
      logoUrl: '/logo.png',
      description: 'Desc',
      websiteUrl: 'https://partner.example',
      category: 'Institution',
    });
    const partner = await promise;
    expect(partner.name).toBe('Partenaire Un');
  });
});
