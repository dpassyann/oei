import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { MembershipApplicationService } from '../../application/service/membership-application.service';
import { computeMembershipEntitlements } from '../../domain/model/membership/membership-entitlement';

/**
 * Guards the future `/espace-membre/store` route (doc §Entitlements: `STORE_ACCESS`) — prepared
 * ahead of the Store feature itself (backend still building it, no frontend route exists yet),
 * following the same `CanActivateFn` style as `cms.guard.ts`/`admin.guard.ts`.
 *
 * Unlike those two (which decode the Keycloak token synchronously), the right to reach the
 * Store depends on the member's `Membership.status`, which is fetched asynchronously — so this
 * guard is async and maps `MembershipApplicationService.getMembership()` through the same pure
 * `computeMembershipEntitlements` used everywhere else (`MembershipEntitlementService`, the
 * component-scoped service used by pages), rather than duplicating the per-status decision
 * table. A member without `STORE_ACCESS` (`PENDING`/`SUSPENDED`/`EXPIRED`/`TERMINATED`) is
 * redirected to `/espace-membre/cotisation` — the actionable next step to unlock the Store —
 * rather than to the public home page, since they *are* an authenticated member, just not
 * (yet) entitled to this one benefit.
 *
 * `memberSpaceGuard` already runs first on the parent `/espace-membre` route, so authentication
 * itself is not re-checked here.
 */
export const storeAccessGuard: CanActivateFn = () => {
  const membershipService = inject(MembershipApplicationService);
  const router = inject(Router);

  return membershipService.getMembership().pipe(
    map((membership) =>
      computeMembershipEntitlements(membership.status).has('STORE_ACCESS')
        ? true
        : router.createUrlTree(['/espace-membre/cotisation']),
    ),
  );
};
