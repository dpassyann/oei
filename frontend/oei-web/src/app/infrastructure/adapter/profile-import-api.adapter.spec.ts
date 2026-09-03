import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ProfileImportApiAdapter } from './profile-import-api.adapter';

describe('ProfileImportApiAdapter', () => {
  function createAdapter(): { adapter: ProfileImportApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [ProfileImportApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(ProfileImportApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenPdfAndConsent_whenInitiateCvImport_thenCallsMultipartEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const file = new File(['demo'], 'profile.pdf', { type: 'application/pdf' });
    const result = firstValueFrom(adapter.initiateCvImport(file, '1.0'));

    const req = httpMock.expectOne('/api/member/v1/profile-import/cv');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect(req.request.body.get('file')).toBe(file);
    expect(req.request.body.get('consentVersion')).toBe('1.0');

    req.flush({
      id: 'imp-1',
      memberId: 'member-1',
      source: 'CV_PDF',
      status: 'DOCUMENT_UPLOADED',
    });

    const profileImport = await result;
    expect(profileImport.id).toBe('imp-1');
    expect(profileImport.status).toBe('DOCUMENT_UPLOADED');
    httpMock.verify();
  });

  it('givenImportId_whenConfirmImport_thenCallsConfirmEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.confirmImport('imp-2'));

    const req = httpMock.expectOne('/api/member/v1/profile-import/imp-2/confirm');
    expect(req.request.method).toBe('POST');
    req.flush({ memberId: 'member-1' });

    const profile = await result;
    expect(profile.memberId).toBe('member-1');
    httpMock.verify();
  });

  it('givenLinkedinAuthorizationCode_whenImportLinkedinBasicFromAuthorizationCode_thenCallsCallbackEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(
      adapter.importLinkedinBasicFromAuthorizationCode(
        'linkedin-auth-code-xyz',
        'http://localhost:4300/espace-membre/smart-onboarding/linkedin/callback',
      ),
    );

    const req = httpMock.expectOne('/api/member/v1/profile-import/linkedin/basic/callback');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      authorizationCode: 'linkedin-auth-code-xyz',
      redirectUri: 'http://localhost:4300/espace-membre/smart-onboarding/linkedin/callback',
    });
    req.flush({ memberId: 'member-3' });

    const profile = await result;
    expect(profile.memberId).toBe('member-3');
    httpMock.verify();
  });
});

