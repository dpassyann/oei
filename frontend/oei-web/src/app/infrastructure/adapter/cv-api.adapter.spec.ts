import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { CvApiAdapter } from './cv-api.adapter';

describe('CvApiAdapter', () => {
  function createAdapter(): { adapter: CvApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [CvApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(CvApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsTemplates_whenListTemplates_thenCallsTemplatesEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listTemplates());
    const req = httpMock.expectOne('/api/member/v1/cv/templates');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'tpl-classic', code: 'CLASSIC', name: 'Classique' }]);
    expect((await result)[0].code).toBe('CLASSIC');
    httpMock.verify();
  });

  it('givenBackendReturnsCvs_whenListCvs_thenCallsCvEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listCvs());
    const req = httpMock.expectOne('/api/member/v1/cv');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(await result).toEqual([]);
    httpMock.verify();
  });

  it('givenCvId_whenGetCv_thenCallsCvIdEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getCv('cv-1'));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'cv-1' });
    expect((await result).id).toBe('cv-1');
    httpMock.verify();
  });

  it('givenCreation_whenCreateCv_thenPostsCreationBodyToCvEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const creation = { templateId: 'tpl-classic', sourceLanguage: 'fr' };
    const result = firstValueFrom(adapter.createCv(creation));
    const req = httpMock.expectOne('/api/member/v1/cv');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creation);
    req.flush({ id: 'cv-2', ...creation, memberId: 'demo-member-1', status: 'DRAFT', sections: [] });
    expect((await result).id).toBe('cv-2');
    httpMock.verify();
  });

  it('givenCv_whenUpdateCv_thenPutsCvBodyToCvIdEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const cv = {
      id: 'cv-1',
      memberId: 'demo-member-1',
      templateId: 'tpl-classic',
      sourceLanguage: 'fr',
      status: 'READY' as const,
      sections: [],
    };
    const result = firstValueFrom(adapter.updateCv('cv-1', cv));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cv);
    req.flush(cv);
    expect((await result).status).toBe('READY');
    httpMock.verify();
  });

  it('givenSection_whenAddSection_thenPostsToSectionsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const section = { type: 'SKILL' as const, order: 0, content: {} };
    const result = firstValueFrom(adapter.addSection('cv-1', section));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1/sections');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(section);
    req.flush({ id: 'section-1', cvId: 'cv-1', translations: [], ...section });
    expect((await result).id).toBe('section-1');
    httpMock.verify();
  });

  it('givenSection_whenUpdateSection_thenPutsToSectionIdEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const section = { id: 'section-1', cvId: 'cv-1', type: 'SKILL' as const, order: 0, content: {}, translations: [] };
    const result = firstValueFrom(adapter.updateSection('cv-1', 'section-1', section));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1/sections/section-1');
    expect(req.request.method).toBe('PUT');
    req.flush(section);
    expect((await result).id).toBe('section-1');
    httpMock.verify();
  });

  it('givenTranslation_whenAddTranslation_thenPostsToTranslationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const translation = { language: 'en', content: {} };
    const result = firstValueFrom(adapter.addTranslation('cv-1', 'section-1', translation));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1/sections/section-1/translations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(translation);
    req.flush({
      id: 'translation-1',
      sectionId: 'section-1',
      language: 'en',
      content: {},
      status: 'MACHINE_GENERATED',
      translatedAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).status).toBe('MACHINE_GENERATED');
    httpMock.verify();
  });

  it('givenLanguage_whenValidateTranslation_thenPostsToValidateEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.validateTranslation('cv-1', 'section-1', 'en'));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1/sections/section-1/translations/en/validate');
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 'translation-1',
      sectionId: 'section-1',
      language: 'en',
      content: {},
      status: 'VALIDATED',
      translatedAt: '2026-01-01T00:00:00Z',
      validatedBy: 'member-1',
    });
    expect((await result).status).toBe('VALIDATED');
    httpMock.verify();
  });

  it('givenRenderRequest_whenRenderCv_thenPostsToRenderEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const request = { language: 'fr', includeBadges: [] };
    const result = firstValueFrom(adapter.renderCv('cv-1', request));
    const req = httpMock.expectOne('/api/member/v1/cv/cv-1/render');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({
      id: 'job-1',
      targetType: 'CV',
      targetId: 'cv-1',
      status: 'PENDING',
      requestedAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).status).toBe('PENDING');
    httpMock.verify();
  });
});
