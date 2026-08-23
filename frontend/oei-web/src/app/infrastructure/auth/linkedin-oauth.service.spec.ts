import { TestBed } from '@angular/core/testing';
import { LinkedinOAuthService } from './linkedin-oauth.service';
import { RuntimeConfig } from '../config/runtime-config';

interface RuntimeConfigOAuthStub {
  readonly linkedinOAuthAuthorizeUrl: () => string;
  readonly linkedinOAuthClientId: () => string;
  readonly linkedinOAuthRedirectUri: () => string;
  readonly linkedinOAuthScope: () => string;
}

describe('LinkedinOAuthService', () => {
  function setup(overrides: Partial<RuntimeConfigOAuthStub>) {
    TestBed.configureTestingModule({
      providers: [
        LinkedinOAuthService,
        {
          provide: RuntimeConfig,
          useValue: {
            linkedinOAuthAuthorizeUrl: () => 'https://www.linkedin.com/oauth/v2/authorization',
            linkedinOAuthClientId: () => '',
            linkedinOAuthRedirectUri: () => 'http://localhost:4300/espace-membre/smart-onboarding/linkedin/callback',
            linkedinOAuthScope: () => 'openid profile email',
            ...overrides,
          },
        },
      ],
    });
    return TestBed.inject(LinkedinOAuthService);
  }

  it('rejects placeholder LinkedIn client ids', () => {
    const service = setup({ linkedinOAuthClientId: () => 'linkedin_client_id_placeholder' });

    expect(() => service.startAuthorizationFlow()).toThrow(/Configuration LinkedIn invalide/);
  });

  it('parses OAuth callback only when code and state are valid', () => {
    const service = setup({ linkedinOAuthClientId: () => 'real-client-id' });
    sessionStorage.setItem('oei_linkedin_oauth_state', 'expected-state');

    const success = service.parseCallback(new URLSearchParams('code=abc123&state=expected-state'));
    expect(success).toEqual({ ok: true, code: 'abc123' });

    sessionStorage.setItem('oei_linkedin_oauth_state', 'expected-state');
    const invalidState = service.parseCallback(new URLSearchParams('code=abc123&state=other-state'));
    expect(invalidState.ok).toBe(false);
  });
});



