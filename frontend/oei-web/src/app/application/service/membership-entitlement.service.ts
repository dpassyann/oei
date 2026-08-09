import { Service, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MembershipApplicationService } from './membership-application.service';
import { MembershipEntitlement, computeMembershipEntitlements } from '../../domain/model/membership/membership-entitlement';

/**
 * Single source of truth for "what is the current member allowed to do, given their
 * `Membership.status`?" (doc `01-MEMBERS-DYNAMIC-SPACE.md` §Entitlements) — computed from
 * `MembershipApplicationService.getMembership()` via the pure
 * `computeMembershipEntitlements` (see that function's doc comment for the per-status
 * decisions, including `GRACE_PERIOD`/`SUSPENDED`/`PENDING`).
 *
 * Component-scoped (not root-singleton), like `MembershipAccessService` which this mirrors:
 * provided via `providers: [MembershipEntitlementService]` on every espace-membre page that
 * needs to gate an action, so a fresh instance/fetch happens each time such a page is
 * (re)entered rather than one persisting (and going stale) for the whole session.
 */
@Service()
export class MembershipEntitlementService {
  private readonly membershipService = inject(MembershipApplicationService);

  private readonly membershipResource = rxResource({
    stream: () => this.membershipService.getMembership(),
  });

  /** `undefined` while the membership hasn't loaded yet. */
  readonly status = computed(() => this.membershipResource.value()?.status);

  /** `true` only once the member's `GRACE_PERIOD` status is positively known — lets pages
   * surface a "renewal imminent" warning without blocking any right (see
   * `computeMembershipEntitlements`'s doc comment on why `GRACE_PERIOD` keeps full rights). */
  readonly renewalImminent = computed(() => this.status() === 'GRACE_PERIOD');

  /** Rights granted by the member's current status. Empty (nothing granted) while the
   * membership hasn't loaded yet — call sites should treat a still-loading entitlement set
   * the same as "not entitled" for anything destructive/irreversible (export, submit, order),
   * rather than optimistically allowing the action before the real status is known. */
  readonly entitlements = computed<ReadonlySet<MembershipEntitlement>>(() => {
    const status = this.status();
    return status ? computeMembershipEntitlements(status) : new Set();
  });

  has(entitlement: MembershipEntitlement): boolean {
    return this.entitlements().has(entitlement);
  }

  reload(): void {
    this.membershipResource.reload();
  }
}
