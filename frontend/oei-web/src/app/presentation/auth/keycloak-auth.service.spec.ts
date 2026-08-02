import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { KeycloakAuthService, NAVIGABLE, type Navigable } from './keycloak-auth.service';

describe('KeycloakAuthService', () => {
  let navigateSpy: ReturnType<typeof vi.fn<(url: string) => void>>;
  let service: KeycloakAuthService;

  beforeEach(() => {
    navigateSpy = vi.fn<(url: string) => void>();
    const testNavigable: Navigable = { navigate: navigateSpy };

    TestBed.configureTestingModule({
      providers: [{ provide: NAVIGABLE, useValue: testNavigable }],
    });

    service = TestBed.inject(KeycloakAuthService);
    sessionStorage.clear();
  });

  it('givenLogin_whenCalled_thenNavigatesToKeycloakAuthorizationUrlWithExpectedParams', async () => {
    service.login();

    await vi.waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(1));

    const calledUrl = new URL(navigateSpy.mock.calls[0][0] as string);

    expect(calledUrl.origin).toBe('http://localhost:8081');
    expect(calledUrl.pathname).toBe('/realms/oei/protocol/openid-connect/auth');
    expect(calledUrl.searchParams.get('client_id')).toBe('oei-frontend');
    expect(calledUrl.searchParams.get('response_type')).toBe('code');
    expect(calledUrl.searchParams.get('redirect_uri')).toBe('http://localhost:4300/');
    expect(calledUrl.searchParams.get('scope')).toBe('openid');
    expect(calledUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(calledUrl.searchParams.get('code_challenge')).toBeTruthy();
  });

  it('givenLogin_whenCalled_thenStoresPkceCodeVerifierInSessionStorage', async () => {
    expect(sessionStorage.length).toBe(0);

    service.login();

    await vi.waitFor(() => expect(sessionStorage.length).toBeGreaterThan(0));
  });

  it('givenLogin_whenCalledTwice_thenGeneratesDifferentCodeChallengesEachTime', async () => {
    service.login();
    await vi.waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(1));

    service.login();
    await vi.waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(2));

    const firstChallenge = new URL(navigateSpy.mock.calls[0][0] as string).searchParams.get(
      'code_challenge',
    );
    const secondChallenge = new URL(navigateSpy.mock.calls[1][0] as string).searchParams.get(
      'code_challenge',
    );

    expect(firstChallenge).not.toBe(secondChallenge);
  });
});
