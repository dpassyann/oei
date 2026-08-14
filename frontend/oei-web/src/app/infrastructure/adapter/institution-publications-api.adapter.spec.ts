import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionPublicationsApiAdapter } from './institution-publications-api.adapter';
import { DEMO_PUBLICATIONS } from './institution-demo-data';

describe('InstitutionPublicationsApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionPublicationsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [InstitutionPublicationsApiAdapter, provideHttpClient(), provideHttpClientTesting()],
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

  it('whenGetPublication_thenCallsPublicationDetailEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getPublication('institution-publication-demo-1'));
    const req = httpMock.expectOne('/api/institution/v1/publications/institution-publication-demo-1');
    expect(req.request.method).toBe('GET');
    req.flush(DEMO_PUBLICATIONS[0]);
    await result;
    httpMock.verify();
  });

  it('whenUpdatePublication_thenPutsCreationBodyToDetailEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const creation = { type: 'REPORT' as const, title: 'Titre modifié', body: 'Corps modifié' };
    const result = firstValueFrom(adapter.updatePublication('institution-publication-demo-1', creation));
    const req = httpMock.expectOne('/api/institution/v1/publications/institution-publication-demo-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(creation);
    req.flush(DEMO_PUBLICATIONS[0]);
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
