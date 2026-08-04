import { InjectionToken, inject, Service, signal } from '@angular/core';

// Small, local config constant rather than a full runtime-config entry — this plan only
// needs the login redirect, not the callback/token-exchange step (see login() below).
const KEYCLOAK_BASE_URL = 'http://localhost:8081';
const KEYCLOAK_REALM = 'oei';
const KEYCLOAK_CLIENT_ID = 'oei-frontend';
const REDIRECT_URI = 'http://localhost:4300/';
const PKCE_VERIFIER_STORAGE_KEY = 'oei_pkce_code_verifier';

/**
 * Abstraction over the actual browser navigation so tests can assert on the
 * constructed authorization URL without triggering a real page navigation.
 */
export interface Navigable {
  navigate(url: string): void;
}

export const NAVIGABLE = new InjectionToken<Navigable>('NAVIGABLE', {
  providedIn: 'root',
  factory: () => ({
    navigate(url: string): void {
      window.location.href = url;
    },
  }),
});

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(randomBytes);
}

async function computeCodeChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base64UrlEncode(new Uint8Array(digest));
}

function buildAuthorizationUrl(codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'openid',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?${params.toString()}`;
}

/**
 * Initiates the Keycloak Authorization Code + PKCE login redirect.
 *
 * NOTE: this plan only implements the redirect-to-login step. The callback route
 * (reading the `code` query param and exchanging it — together with the stored
 * `code_verifier` — for tokens) is explicitly out of scope and left for a later plan.
 */
const MOCK_AUTH_STORAGE_KEY = 'oei_mock_authenticated';

function resolveInitialMockAuthenticated(): boolean {
  // The espace-membre guard (`presentation/auth/member-space.guard.ts`) needs *some*
  // authenticated/not-authenticated state to check, but the real Keycloak callback/token
  // exchange step is explicitly out of scope for this plan (see class doc above) — so we
  // keep a simple mocked "connected" flag instead, defaulting to `true` so the demo member
  // space is reachable without a real login round-trip, and offer `setMockAuthenticated()`
  // for demo/tests to simulate a "logged out" state without needing a real Keycloak session.
  try {
    const stored = sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

@Service()
export class KeycloakAuthService {
  private readonly navigable = inject(NAVIGABLE);

  private readonly mockAuthenticatedSignal = signal<boolean>(resolveInitialMockAuthenticated());

  /** Mocked "is the visitor connected" state — see `resolveInitialMockAuthenticated()` above. */
  readonly isAuthenticated = this.mockAuthenticatedSignal.asReadonly();

  login(): void {
    const verifier = generateCodeVerifier();
    sessionStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, verifier);

    void computeCodeChallenge(verifier).then((codeChallenge) => {
      const authorizationUrl = buildAuthorizationUrl(codeChallenge);
      this.navigable.navigate(authorizationUrl);
    });
  }

  /** Demo/test-only toggle for the mocked authenticated state (see class doc). */
  setMockAuthenticated(value: boolean): void {
    this.mockAuthenticatedSignal.set(value);
    try {
      sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, String(value));
    } catch {
      // sessionStorage unavailable (private mode, etc.) — not blocking, in-memory signal still updates.
    }
  }
}
