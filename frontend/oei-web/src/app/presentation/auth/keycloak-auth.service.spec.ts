import { TestBed } from '@angular/core/testing';
import { OAuthErrorEvent, OAuthInfoEvent, OAuthService } from 'angular-oauth2-oidc';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { KeycloakAuthService } from './keycloak-auth.service';
import { LoggingService } from '../../infrastructure/logging/logging.service';

/** Base64url-encodes a JWT payload, exactly like a real Keycloak access token would carry it —
 * no signature verification happens client-side here (nor in `KeycloakAuthService`, see its doc
 * comment), so an arbitrary/unsigned third segment is fine for these tests. */
function fakeAccessToken(payload: Record<string, unknown>): string {
  const base64url = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('KeycloakAuthService', () => {
  let oauthService: {
    initCodeFlow: ReturnType<typeof vi.fn>;
    hasValidAccessToken: ReturnType<typeof vi.fn>;
    getAccessToken: ReturnType<typeof vi.fn>;
    logOut: ReturnType<typeof vi.fn>;
    events: Subject<unknown>;
  };
  let service: KeycloakAuthService;

  beforeEach(() => {
    oauthService = {
      initCodeFlow: vi.fn(),
      hasValidAccessToken: vi.fn().mockReturnValue(false),
      getAccessToken: vi.fn().mockReturnValue(''),
      logOut: vi.fn(),
      events: new Subject<unknown>(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OAuthService, useValue: oauthService }],
    });

    service = TestBed.inject(KeycloakAuthService);
  });

  it('givenLogin_whenCalled_thenInitiatesTheRealCodeFlowWithNoExtraParams', () => {
    service.login();

    expect(oauthService.initCodeFlow).toHaveBeenCalledWith();
  });

  it('givenRegister_whenCalled_thenInitiatesTheCodeFlowWithKeycloakRegisterAction', () => {
    service.register();

    expect(oauthService.initCodeFlow).toHaveBeenCalledWith('', { kc_action: 'REGISTER' });
  });

  it('givenLogout_whenCalled_thenDelegatesToOAuthServiceLogOut', () => {
    service.logout();

    expect(oauthService.logOut).toHaveBeenCalledTimes(1);
  });

  describe('isAuthenticated', () => {
    it('givenNoValidAccessToken_whenChecked_thenIsNotAuthenticated', () => {
      oauthService.hasValidAccessToken.mockReturnValue(false);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('givenValidAccessToken_whenChecked_thenIsAuthenticated', () => {
      oauthService.hasValidAccessToken.mockReturnValue(true);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('hasAnyRole', () => {
    it('givenNoValidAccessToken_whenCheckingRoles_thenNeverMatches', () => {
      oauthService.hasValidAccessToken.mockReturnValue(false);

      expect(service.hasAnyRole(['admin', 'member'])).toBe(false);
    });

    it('givenAccessTokenWithRealmAccessRoles_whenCheckingMatchingRole_thenMatches', () => {
      oauthService.hasValidAccessToken.mockReturnValue(true);
      oauthService.getAccessToken.mockReturnValue(fakeAccessToken({ realm_access: { roles: ['admin', 'member'] } }));

      expect(service.hasAnyRole(['admin'])).toBe(true);
      expect(service.hasAnyRole(['editor'])).toBe(false);
    });

    it('givenAccessTokenWithoutRealmAccessClaim_whenCheckingRoles_thenNeverMatches', () => {
      oauthService.hasValidAccessToken.mockReturnValue(true);
      oauthService.getAccessToken.mockReturnValue(fakeAccessToken({ sub: 'user-1' }));

      expect(service.hasAnyRole(['admin'])).toBe(false);
    });

    it('givenMalformedAccessToken_whenCheckingRoles_thenReturnsFalseInsteadOfThrowing', () => {
      oauthService.hasValidAccessToken.mockReturnValue(true);
      oauthService.getAccessToken.mockReturnValue('not-a-jwt');

      expect(service.hasAnyRole(['admin'])).toBe(false);
    });
  });

  describe('logging', () => {
    it('givenLogin_whenCalled_thenLogsAnInfoLine', () => {
      const logger = TestBed.inject(LoggingService);
      const infoSpy = vi.spyOn(logger, 'info');

      service.login();

      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('login'), expect.anything(), 'KeycloakAuthService');
    });

    it('givenOAuthErrorEvent_whenEmitted_thenLogsItAsAnError', () => {
      const logger = TestBed.inject(LoggingService);
      const errorSpy = vi.spyOn(logger, 'error');

      oauthService.events.next(new OAuthErrorEvent('token_error', { message: 'invalid_grant' }));

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('token_error'),
        expect.objectContaining({ eventType: 'token_error' }),
        'KeycloakAuthService',
      );
    });

    it('givenOAuthErrorEventReasonContainsAToken_whenLogged_thenTheTokenIsRedacted', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      oauthService.events.next(new OAuthErrorEvent('token_error', { accessToken: 'super-secret-token-value' }));

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logged = consoleErrorSpy.mock.calls[0][0] as string;
      expect(logged).not.toContain('super-secret-token-value');
    });

    it('givenNonErrorOAuthEvent_whenEmitted_thenDoesNotLogAnError', () => {
      const logger = TestBed.inject(LoggingService);
      const errorSpy = vi.spyOn(logger, 'error');

      oauthService.events.next(new OAuthInfoEvent('token_received'));

      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
