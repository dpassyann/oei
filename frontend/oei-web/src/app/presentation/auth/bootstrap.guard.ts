import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakAuthService } from './keycloak-auth.service';
import { MemberOnboardingFlowService } from '../../application/service/member-onboarding-flow.service';

/**
 * Bootstrap-aware route guard for the main member space (EspaceMembreLayout children).
 *
 * After authentication, calls GET /api/member/v1/bootstrap to determine the profile status.
 * If profileStatus = ONBOARDING_REQUIRED or ONBOARDING_IN_PROGRESS, redirects to
 * /espace-membre/smart-onboarding so the member completes the import-first onboarding flow
 * before accessing profile-dependent features.
 *
 * Does NOT block:
 * - The smart-onboarding route itself (it handles its own flow).
 * - The legacy inscription wizard (/espace-membre/inscription).
 * - Public/static content (not under /espace-membre).
 *
 * Technical note: this guard performs one HTTP call per navigation to the member space root.
 * Once a profile exists (READY/PROFILE_INCOMPLETE), the guard returns true immediately on
 * subsequent navigations — the bootstrap response is cheap (one DB read, no JOINs).
 * A future optimization could cache the result for the session lifetime.
 */
export const bootstrapGuard: CanActivateFn = (_route, state) => {
  const keycloakAuth = inject(KeycloakAuthService);
  const onboardingFlow = inject(MemberOnboardingFlowService);

  if (!keycloakAuth.isAuthenticated()) {
    keycloakAuth.login();
    return false;
  }

  // Allow smart-onboarding and inscription routes to bypass the bootstrap check
  // (they are part of the onboarding resolution themselves).
  const targetUrl = state.url;
  if (targetUrl.includes('/smart-onboarding') || targetUrl.includes('/inscription')) {
    return true;
  }

  return onboardingFlow.refresh();
};

