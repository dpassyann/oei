import { InjectionToken, inject, Service, signal } from '@angular/core';

// Small, local config constant rather than a full runtime-config entry — this plan only
// needs the login redirect, not the callback/token-exchange step (see login() below).
const KEYCLOAK_BASE_URL = 'http://localhost:8081';
const KEYCLOAK_REALM = 'oei';
const KEYCLOAK_CLIENT_ID = 'oei-frontend';
const REDIRECT_URI = 'http://localhost:4300/';
const PKCE_VERIFIER_STORAGE_KEY = 'oei_pkce_code_verifier';

// Design decision (documented — the callback/token-exchange step is explicitly out of scope, see
// the class-level note below): with no real token exchange implemented yet, the CMS route guard
// (`presentation/auth/cms.guard.ts`) still needs *some* signal to decide whether the current
// visitor may reach `/cms`. Rather than inventing a parallel ad hoc mechanism, this reads a small,
// clearly-named `sessionStorage` entry that a real callback step would populate with the decoded
// JWT's realm roles once implemented — and that a mocked login flow (or an e2e test) can set
// directly in the meantime. This is *not* a security boundary (no signature verification, no
// tokens): it only gates which back-office UI renders in this mocked-end-to-end plan.
const MOCK_SESSION_ROLES_STORAGE_KEY = 'oei_mock_session_roles';

function readStoredSessionRoles(): readonly string[] {
  try {
    const raw = sessionStorage.getItem(MOCK_SESSION_ROLES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((role): role is string => typeof role === 'string') : [];
  } catch {
    return [];
  }
}

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

function buildAuthorizationUrl(codeChallenge: string, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'openid',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    ...extraParams,
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
@Service()
export class KeycloakAuthService {
  private readonly navigable = inject(NAVIGABLE);

  // Signal-backed (not a plain read-from-storage getter) so that any component — notably the
  // header's connected-state dropdown — reactively re-renders the moment `setMockSessionRoles`/
  // `clearMockSession`/`setMockAuthenticated` is called anywhere in the app, without needing a
  // navigation to happen first (route guards re-invoke naturally on navigation; components don't).
  private readonly sessionRolesSignal = signal<readonly string[]>(readStoredSessionRoles());

  login(): void {
    const verifier = generateCodeVerifier();
    sessionStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, verifier);

    void computeCodeChallenge(verifier).then((codeChallenge) => {
      const authorizationUrl = buildAuthorizationUrl(codeChallenge);
      this.navigable.navigate(authorizationUrl);
    });
  }

  /**
   * Initiates account creation via Keycloak's native registration screen, replacing the former
   * homemade `/inscription` Angular page (removed — see `app.routes.ts`'s note at the same
   * location). This reuses the exact same authorization-code + PKCE redirect as `login()`, only
   * adding the standard `kc_action=REGISTER` query param so the standard Keycloak login theme
   * (`login.ftl`) renders the registration form instead of the login form on first paint — this
   * is the documented Keycloak convention (kept working across the classic and declarative
   * User Profile setups; no separate `/registrations` endpoint is required from Keycloak 24+
   * onward, which is what this realm runs — see `infra/docker-compose.yml`,
   * `quay.io/keycloak/keycloak:25.0`). The custom OEI login theme
   * (`keycloak/themes/oei/login/`) carries the extra business fields (country, consent) via the
   * declarative User Profile — see that theme's README for details.
   *
   * NOTE: exactly like `login()` above, only the redirect step is implemented here. The
   * callback route (reading the `code` query param and exchanging it for tokens) remains
   * explicitly out of scope and left for a later plan.
   */
  register(): void {
    const verifier = generateCodeVerifier();
    sessionStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, verifier);

    void computeCodeChallenge(verifier).then((codeChallenge) => {
      const authorizationUrl = buildAuthorizationUrl(codeChallenge, { kc_action: 'REGISTER' });
      this.navigable.navigate(authorizationUrl);
    });
  }

  /** Realm roles for the current mocked session (see `MOCK_SESSION_ROLES_STORAGE_KEY` above) —
   * empty when nobody is "logged in". */
  getSessionRoles(): readonly string[] {
    return this.sessionRolesSignal();
  }

  /**
   * Whether the current visitor holds a mocked session, used by route guards (e.g.
   * `institutionAccessGuard`, `cmsGuard`) to protect back-office areas.
   *
   * NOTE: as documented above, this plan does not implement the PKCE callback/token-exchange
   * step — nothing writes real tokens yet. This reflects the *mocked* session roles set via
   * `setMockSessionRoles()` (by a mocked login flow or a test), not a verified JWT.
   */
  isAuthenticated(): boolean {
    return this.sessionRolesSignal().length > 0;
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const sessionRoles = this.sessionRolesSignal();
    return roles.some((role) => sessionRoles.includes(role));
  }

  /** Test/mock-only helper: sets the mocked session roles (e.g. `['admin']`) so route guards and
   * back-office UI behave as if a real Keycloak login had completed. */
  setMockSessionRoles(roles: readonly string[]): void {
    sessionStorage.setItem(MOCK_SESSION_ROLES_STORAGE_KEY, JSON.stringify(roles));
    this.sessionRolesSignal.set(roles);
  }

  clearMockSession(): void {
    sessionStorage.removeItem(MOCK_SESSION_ROLES_STORAGE_KEY);
    this.sessionRolesSignal.set([]);
  }

  /** Demo/test-only convenience wrapper over the mocked session roles, used by the
   * espace-membre-individuel plan: `true` grants a basic `member` session, `false` clears it. */
  setMockAuthenticated(value: boolean): void {
    if (value) {
      this.setMockSessionRoles(['member']);
    } else {
      this.clearMockSession();
    }
  }
}
