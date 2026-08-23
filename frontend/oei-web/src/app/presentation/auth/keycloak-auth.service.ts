import { inject, Service } from '@angular/core';
import { OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { LoggingService } from '../../infrastructure/logging/logging.service';

/**
 * Additional Keycloak-specific query param appended to the authorization URL to land the user
 * directly on the registration form instead of the login form — this is Keycloak's own
 * `kc_action=REGISTER` convention (client `oei-frontend`, realm `oei`), not something invented by
 * this app. See `KeycloakAuthService.register()`.
 */
const REGISTER_QUERY_PARAMS = { kc_action: 'REGISTER' };

/**
 * Decodes the payload of a JWT without verifying its signature. Signature verification already
 * happened server-side at the token endpoint (and, if configured, via `angular-oauth2-oidc`'s
 * `ValidationHandler` against the discovery document's JWKS for the id_token) — this only reads
 * claims out of a token this app already trusts because `OAuthService` obtained it directly from
 * Keycloak's token endpoint over the code exchange.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) {
    return undefined;
  }
  const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const decoded = decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  const parsed: unknown = JSON.parse(decoded);
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : undefined;
}

/**
 * Real Keycloak Authorization Code + PKCE integration, delegating to `OAuthService`
 * (`angular-oauth2-oidc`) — configured once at bootstrap in `app.config.ts` (issuer, clientId,
 * redirectUri, discovery document load + `tryLogin()`, see that file for the exact config).
 *
 * What is actually implemented (unlike the previous mocked version of this file):
 * - `login()` / `register()` redirect to Keycloak's real `/protocol/openid-connect/auth`
 *   endpoint via `OAuthService.initCodeFlow()`, which generates and stores the PKCE
 *   code_verifier/code_challenge itself.
 * - The return trip is handled: `app.config.ts`'s app initializer calls
 *   `OAuthService.loadDiscoveryDocumentAndTryLogin()` *before* the router resolves its first
 *   navigation, which detects the `?code=...` query param on `redirectUri`, exchanges it for real
 *   tokens at Keycloak's token endpoint, and stores them via the library's default
 *   `OAuthStorage` (sessionStorage — see this app's ADR/report for the storage-location
 *   trade-off, not decided in this file).
 * - `isAuthenticated()` reflects a real, non-expired access token
 *   (`OAuthService.hasValidAccessToken()`) — not a mocked flag.
 * - `hasAnyRole()` decodes the *real* access token and reads Keycloak's own `realm_access.roles`
 *   claim (the realm roles claim Keycloak puts on access tokens for this client by default).
 * - `logout()` calls the real Keycloak end-session endpoint (`OAuthService.logOut()`), clearing
 *   the stored tokens and redirecting back to `redirectUri`.
 *
 * Known limitations — explicitly not implemented here (flagged rather than silently decided):
 * - No silent/automatic refresh-token flow (`OAuthService.setupAutomaticSilentRefresh()` is not
 *   wired up): once the access token expires, `isAuthenticated()` simply becomes `false` again
 *   and the user must log in again — there is no background renewal.
 * - Token storage location (sessionStorage, the library's default) vs. an in-memory-only storage
 *   (safer against XSS token exfiltration, but lost on refresh) is an open trade-off — not
 *   resolved in this file, see this task's final report.
 */
@Service()
export class KeycloakAuthService {
  private readonly oauthService = inject(OAuthService);
  private readonly logger = inject(LoggingService);

  constructor() {
    // `OAuthService.events` emits every lifecycle event, including the auth-failure ones
    // (`token_error`, `discovery_document_load_error`, `session_error`, ...) — see
    // `angular-oauth2-oidc`'s `EventType`. Logging only the `*_error`/`*error*` ones here is
    // the "high-value" hook this task asked for: end-to-end tracing of why a login/refresh
    // failed, without instrumenting every successful token exchange too. `event.reason`
    // (an `OAuthErrorEvent`'s underlying error/response) goes through `LoggingService`'s
    // built-in redaction, so a token accidentally present in it is never logged verbatim.
    this.oauthService.events?.subscribe((event) => {
      if (!event.type.toLowerCase().includes('error')) {
        return;
      }
      const reason = event instanceof OAuthErrorEvent ? event.reason : undefined;
      this.logger.error(`Keycloak auth event failed: ${event.type}`, { eventType: event.type, reason }, 'KeycloakAuthService');
    });
  }

  login(): void {
    this.logger.info('Keycloak login flow initiated', { flow: 'login' }, 'KeycloakAuthService');
    this.oauthService.initCodeFlow();
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
   * `quay.io/keycloak/keycloak:25.0`). The custom
   * OEI login theme
   * (`keycloak/themes/oei/login/`) carries the extra business fields (country, consent) via the
   * declarative User Profile — see that theme's README for details.
   */
  register(): void {
    this.logger.info('Keycloak register flow initiated', { flow: 'register' }, 'KeycloakAuthService');
    this.oauthService.initCodeFlow('', REGISTER_QUERY_PARAMS);
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const realmRoles = this.getRealmRoles();
    return roles.some((role) => realmRoles.includes(role));
  }

  /**
   * Exposes the raw realm roles claim (small, additive accessor — added for the admin console's
   * sidebar nav, which needs the *full* role list to filter sections via
   * `domain/model/admin/admin-role.ts`'s `visibleSections()`, rather than a single yes/no check
   * like `hasAnyRole()`).
   */
  getRoles(): readonly string[] {
    return this.getRealmRoles();
  }

  getDisplayName(): string {
    return (
      this.getIdentityClaimString('name') ??
      this.getIdentityClaimString('preferred_username') ??
      this.getIdentityClaimString('given_name') ??
      ''
    );
  }

  getPictureUrl(): string {
    return this.getIdentityClaimString('picture') ?? '';
  }

  logout(): void {
    this.logger.info('Keycloak logout initiated', { flow: 'logout' }, 'KeycloakAuthService');
    this.oauthService.logOut();
  }

  private getRealmRoles(): readonly string[] {
    if (!this.oauthService.hasValidAccessToken()) {
      return [];
    }
    try {
      const payload = decodeJwtPayload(this.oauthService.getAccessToken());
      const realmAccess = payload?.['realm_access'];
      const roles =
        typeof realmAccess === 'object' && realmAccess !== null
          ? (realmAccess as Record<string, unknown>)['roles']
          : undefined;
      return Array.isArray(roles) ? roles.filter((role): role is string => typeof role === 'string') : [];
    } catch {
      return [];
    }
  }

  private getIdentityClaimString(claim: string): string | undefined {
    const identityClaims = this.oauthService.getIdentityClaims();
    if (identityClaims && typeof identityClaims === 'object') {
      const value = (identityClaims as Record<string, unknown>)[claim];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    try {
      const payload = decodeJwtPayload(this.oauthService.getAccessToken());
      const value = payload?.[claim];
      return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
    } catch {
      return undefined;
    }
  }
}
