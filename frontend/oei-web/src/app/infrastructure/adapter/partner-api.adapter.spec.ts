import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PartnerApiAdapter } from './partner-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

const SAMPLE_PARTNER = {
  id: 'p1',
  name: 'Partenaire Un',
  logoUrl: '/logo.png',
  description: 'Desc',
  websiteUrl: 'https://partner.example',
  category: 'Institution',
};

describe('PartnerApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: PartnerApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        PartnerApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(PartnerApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsPartners_whenGetPartners_thenMapsToDomainPartners', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getPartners('fr'));
    const req = httpMock.expectOne('/api/v1/partners/fr');
    req.flush([SAMPLE_PARTNER]);

    const partners = await result;
    expect(partners[0].id).toBe('p1');
    httpMock.verify();
  });

  it('givenNonDefaultApiBaseUrl_whenGetPartners_thenBuildsUrlFromRuntimeConfig', async () => {
    const { adapter, httpMock } = createAdapter('/custom-api');

    const result = firstValueFrom(adapter.getPartners('en'));
    const req = httpMock.expectOne('/custom-api/partners/en');
    req.flush([]);

    await result;
    httpMock.verify();
  });

  it('givenBackendReturnsPartner_whenGetPartner_thenBuildsUrlWithLangAndIdAndMapsResult', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getPartner('p1', 'fr'));
    const req = httpMock.expectOne('/api/v1/partners/fr/p1');
    req.flush(SAMPLE_PARTNER);

    const partner = await result;
    expect(partner.name).toBe('Partenaire Un');
    httpMock.verify();
  });
});
