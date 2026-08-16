import { Service, inject } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ADMIN_MEMBERS_PORT } from '../../domain/port/admin/admin-members.port';
import { AdminMemberSummary } from '../../domain/model/admin/admin-member';
import { AdminAuditService } from './admin-audit.service';

const ENTITY_TYPE = 'Member';

/**
 * Wraps `AdminMembersPort` and journals every mutating action via `AdminAuditService` (task brief
 * §Audit), same convention as `AdminInstitutionsApplicationService` — pages never call the port
 * directly so no action can skip being audited.
 */
@Service()
export class AdminMembersApplicationService {
  private readonly port = inject(ADMIN_MEMBERS_PORT);
  private readonly auditService = inject(AdminAuditService);

  list(): Observable<AdminMemberSummary[]> {
    return this.port.list();
  }

  resyncPayment(member: AdminMemberSummary): Observable<AdminMemberSummary> {
    return this.mutate(member, 'MEMBER_RESYNC_PAYMENT', () => this.port.resyncPayment(member.id));
  }

  suspend(member: AdminMemberSummary, reason: string): Observable<AdminMemberSummary> {
    return this.mutate(member, 'MEMBER_SUSPEND', () => this.port.suspend(member.id, reason), reason);
  }

  liftSuspension(member: AdminMemberSummary): Observable<AdminMemberSummary> {
    return this.mutate(member, 'MEMBER_LIFT_SUSPENSION', () => this.port.liftSuspension(member.id));
  }

  setExceptionalStatus(member: AdminMemberSummary, status: 'EXCEPTIONAL_FREE' | 'EXCEPTIONAL_HONORARY'): Observable<AdminMemberSummary> {
    return this.mutate(member, 'MEMBER_SET_EXCEPTIONAL_STATUS', () => this.port.setExceptionalStatus(member.id, status));
  }

  private mutate(
    before: AdminMemberSummary,
    action: string,
    call: () => Observable<AdminMemberSummary>,
    reason?: string | null,
  ): Observable<AdminMemberSummary> {
    return call().pipe(
      switchMap((after) =>
        this.auditService
          .log(
            action,
            { type: ENTITY_TYPE, id: before.id },
            { membershipStatus: before.membershipStatus },
            { membershipStatus: after.membershipStatus },
            reason ?? null,
          )
          .pipe(map(() => after)),
      ),
    );
  }
}
