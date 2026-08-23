import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MemberBootstrapApiAdapter } from './member-bootstrap-api.adapter';

describe('MemberBootstrapApiAdapter', () => {
  function createAdapter(): { adapter: MemberBootstrapApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [MemberBootstrapApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(MemberBootstrapApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenReadyProfile_whenGetBootstrap_thenCallsBootstrapEndpointAndReturnsMemberBootstrap', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getBootstrap());

    const req = httpMock.expectOne('/api/member/v1/bootstrap');
    expect(req.request.method).toBe('GET');
    req.flush({
      memberId: 'member-1',
      profileStatus: 'READY',
      membershipStatus: 'ACTIVE',
      profileId: 'profile-1',
    });

    const bootstrap = await result;
    expect(bootstrap.memberId).toBe('member-1');
    expect(bootstrap.profileStatus).toBe('READY');
    expect(bootstrap.membershipStatus).toBe('ACTIVE');
    expect(bootstrap.profileId).toBe('profile-1');
    httpMock.verify();
  });

  it('givenNewAccount_whenGetBootstrap_thenReturnsOnboardingRequiredWithNullMembershipAndProfile', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getBootstrap());

    const req = httpMock.expectOne('/api/member/v1/bootstrap');
    req.flush({
      memberId: 'member-2',
      profileStatus: 'ONBOARDING_REQUIRED',
      membershipStatus: null,
      profileId: null,
    });

    const bootstrap = await result;
    expect(bootstrap.profileStatus).toBe('ONBOARDING_REQUIRED');
    expect(bootstrap.membershipStatus).toBeNull();
    expect(bootstrap.profileId).toBeNull();
    httpMock.verify();
  });
});

