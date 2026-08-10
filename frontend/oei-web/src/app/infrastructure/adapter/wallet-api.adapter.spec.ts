import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { WalletApiAdapter } from './wallet-api.adapter';

describe('WalletApiAdapter', () => {
  function createAdapter(): { adapter: WalletApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [WalletApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(WalletApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  const rawPass = {
    id: 'pass-1',
    memberId: 'member-1',
    provider: 'APPLE',
    status: 'MOCKED',
    serialNumber: 'SERIAL-1',
    issuedAt: '2026-01-01T00:00:00Z',
  };

  it('givenBackendReturnsPasses_whenListPasses_thenCallsPassesEndpointAndForcesMockedTrue', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listPasses());
    const req = httpMock.expectOne('/api/member/v1/wallet/passes');
    expect(req.request.method).toBe('GET');
    req.flush([rawPass]);
    const passes = await result;
    expect(passes[0].id).toBe('pass-1');
    expect(passes[0].mocked).toBe(true);
    httpMock.verify();
  });

  it('givenBackendReturnsPass_whenIssueApplePass_thenPostsToApplePassEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.issueApplePass());
    const req = httpMock.expectOne('/api/member/v1/wallet/apple-pass');
    expect(req.request.method).toBe('POST');
    req.flush(rawPass);
    const pass = await result;
    expect(pass.provider).toBe('APPLE');
    expect(pass.mocked).toBe(true);
    httpMock.verify();
  });

  it('givenBackendReturnsPass_whenIssueGooglePass_thenPostsToGooglePassEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.issueGooglePass());
    const req = httpMock.expectOne('/api/member/v1/wallet/google-pass');
    expect(req.request.method).toBe('POST');
    req.flush({ ...rawPass, provider: 'GOOGLE' });
    const pass = await result;
    expect(pass.provider).toBe('GOOGLE');
    expect(pass.mocked).toBe(true);
    httpMock.verify();
  });

  it('givenBackendReturnsRevokedPass_whenRevokePass_thenPostsToRevokeEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.revokePass('pass-1'));
    const req = httpMock.expectOne('/api/member/v1/wallet/passes/pass-1/revoke');
    expect(req.request.method).toBe('POST');
    req.flush({ ...rawPass, status: 'REVOKED', revokedAt: '2026-02-01T00:00:00Z' });
    const pass = await result;
    expect(pass.status).toBe('REVOKED');
    expect(pass.mocked).toBe(true);
    httpMock.verify();
  });

  it('givenBackendReturnsVerification_whenVerifyPass_thenGetsPublicVerifyEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.verifyPass('SERIAL-1'));
    const req = httpMock.expectOne('/api/public/v1/wallet/passes/SERIAL-1/verify');
    expect(req.request.method).toBe('GET');
    req.flush({ valid: true, memberPublicSlug: 'jane-dupont', status: 'ISSUED', tier: 'SILVER' });
    const verification = await result;
    expect(verification?.valid).toBe(true);
    httpMock.verify();
  });

  it('givenBackend404_whenVerifyPass_thenResolvesToNull', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.verifyPass('unknown-token'));
    const req = httpMock.expectOne('/api/public/v1/wallet/passes/unknown-token/verify');
    req.flush('not found', { status: 404, statusText: 'Not Found' });
    expect(await result).toBeNull();
    httpMock.verify();
  });
});
