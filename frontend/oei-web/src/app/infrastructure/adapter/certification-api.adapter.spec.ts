import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { CertificationApiAdapter } from './certification-api.adapter';

describe('CertificationApiAdapter', () => {
  function createAdapter(): { adapter: CertificationApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [CertificationApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(CertificationApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsCertifications_whenListCertifications_thenCallsCertificationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listCertifications());
    const req = httpMock.expectOne('/api/member/v1/certifications');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(await result).toEqual([]);
    httpMock.verify();
  });

  it('givenCertificationId_whenGetCertification_thenCallsCertificationIdEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getCertification('cert-1'));
    const req = httpMock.expectOne('/api/member/v1/certifications/cert-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'cert-1' });
    expect((await result).id).toBe('cert-1');
    httpMock.verify();
  });

  it('givenDeclaration_whenDeclareCertification_thenPostsDeclarationBodyToCertificationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const declaration = { name: 'AWS Certified Solutions Architect', issuingOrganization: 'Amazon Web Services' };
    const result = firstValueFrom(adapter.declareCertification(declaration));
    const req = httpMock.expectOne('/api/member/v1/certifications');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(declaration);
    req.flush({ id: 'cert-2', ...declaration, memberId: 'demo-member-1', status: 'DECLARED' });
    expect((await result).status).toBe('DECLARED');
    httpMock.verify();
  });

  it('givenBackendReturnsRecognizedCertifications_whenListRecognizedCertifications_thenCallsPublicRecognizedEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listRecognizedCertifications());
    const req = httpMock.expectOne('/api/public/v1/recognized-certifications');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'rc-1', name: 'AWS Certified Solutions Architect', issuingOrganization: 'AWS', autoValidate: true }]);
    expect((await result)[0].id).toBe('rc-1');
    httpMock.verify();
  });
});
