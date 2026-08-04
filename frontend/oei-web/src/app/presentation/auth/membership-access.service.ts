import { Service, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MembershipFeeApplicationService } from '../../application/service/membership-fee-application.service';
import { MembershipFeeStatus } from '../../domain/model/membership-fee/membership-fee-status';

/**
 * Single source of truth for "is the current member's espace membre read-only because their
 * cotisation isn't paid for the current cycle?" — injected as a **component-scoped** provider
 * (see `profil.ts`/`cv-builder.ts`'s `providers: [MembershipAccessService]`) by every page
 * that needs to gate an edit action, rather than each page re-deriving this from
 * `MembershipFeeApplicationService` on its own. Component-scoped (not root-singleton) so a
 * fresh instance — and a fresh fetch — is created every time a guarded espace-membre page is
 * (re)entered; these pages are only ever reachable once `memberSpaceGuard` has already
 * confirmed the visitor is authenticated, so no auth check is duplicated here.
 */
@Service()
export class MembershipAccessService {
  private readonly membershipFeeService = inject(MembershipFeeApplicationService);

  private readonly statusResource = rxResource({
    stream: () => this.membershipFeeService.getStatus(),
  });

  readonly status = computed<MembershipFeeStatus | undefined>(() => this.statusResource.value());

  /** `true` only once we positively know the current cycle's cotisation is unpaid — while
   * the status is still loading, edit actions are NOT blocked, avoiding a false "read-only"
   * flash before the real status is known. */
  readonly isReadOnly = computed(() => this.status()?.isPaid === false);

  reload(): void {
    this.statusResource.reload();
  }
}
