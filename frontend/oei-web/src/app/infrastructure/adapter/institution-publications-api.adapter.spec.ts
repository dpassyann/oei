import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionPublicationsApiAdapter } from './institution-publications-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';
import { DEMO_PUBLICATIONS } from './institution-demo-data';

describe('InstitutionPublicationsApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionPublicationsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        InstitutionPublicationsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api' } },
      ],
    });
    return { adapter: TestBed.inject(InstitutionPublicationsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenListPublications_thenCallsPublicationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listPublications());
    httpMock.expectOne('/api/institution/v1/publications').flush(DEMO_PUBLICATIONS);
    await result;
    httpMock.verify();
  });

  it('whenCreatePublication_thenPostsCreationBody', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.createPublication({ type: 'REPORT', title: 'Titre', body: 'Corps' }));
    const req = httpMock.expectOne('/api/institution/v1/publications');
    expect(req.request.method).toBe('POST');
    req.flush(DEMO_PUBLICATIONS[0]);
    await result;
    httpMock.verify();
  });

  it('whenSubmitPublication_thenPostsToSubmitEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.submitPublication('institution-publication-demo-2'));
    const req = httpMock.expectOne('/api/institution/v1/publications/institution-publication-demo-2/submit');
    expect(req.request.method).toBe('POST');
    req.flush(DEMO_PUBLICATIONS[1]);
    await result;
    httpMock.verify();
  });
});
