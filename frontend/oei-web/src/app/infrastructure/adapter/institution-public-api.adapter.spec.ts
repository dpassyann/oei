import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionPublicApiAdapter } from './institution-public-api.adapter';
import { DEMO_INSTITUTION } from './institution-demo-data';

describe('InstitutionPublicApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionPublicApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [InstitutionPublicApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(InstitutionPublicApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenGetPublicInstitution_thenCallsPublicInstitutionsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getPublicInstitution('demo-institution'));
    const req = httpMock.expectOne('/api/public/v1/institutions/demo-institution');
    expect(req.request.method).toBe('GET');
    req.flush({ institution: DEMO_INSTITUTION, partnership: null, publications: [], opportunities: [] });
    await result;
    httpMock.verify();
  });

  it('given404_whenGetPublicInstitution_thenPropagatesErrorRatherThanSwallowingIt', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getPublicInstitution('unknown-slug'));
    const req = httpMock.expectOne('/api/public/v1/institutions/unknown-slug');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    await expect(result).rejects.toThrow();
    httpMock.verify();
  });
});
