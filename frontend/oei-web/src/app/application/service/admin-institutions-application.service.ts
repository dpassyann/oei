import { Service, inject } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ADMIN_INSTITUTIONS_PORT, AdminInstitutionCreationInput } from '../../domain/port/admin/admin-institutions.port';
import { Institution } from '../../domain/model/institution/institution';
import { availableActions, InstitutionWorkflowActionName } from '../../domain/model/institution/institution-workflow';
import { AdminAuditService } from './admin-audit.service';

const ENTITY_TYPE = 'Institution';

/**
 * Wraps `AdminInstitutionsPort` and journals every mutating action via `AdminAuditService`
 * (task brief §Audit) so `AdminInstitutions` pages never call the port directly and forget to
 * audit a transition. Approve/activate/suspend/revoke each capture the institution's `status`
 * before and after the call.
 */
@Service()
export class AdminInstitutionsApplicationService {
  private readonly port = inject(ADMIN_INSTITUTIONS_PORT);
  private readonly auditService = inject(AdminAuditService);

  list(): Observable<Institution[]> {
    return this.port.list();
  }

  getById(id: string): Observable<Institution> {
    return this.port.getById(id);
  }

  create(input: AdminInstitutionCreationInput): Observable<Institution> {
    return this.port.create(input).pipe(
      switchMap((created) =>
        this.auditService
          .log('INSTITUTION_CREATE', { type: ENTITY_TYPE, id: created.id }, null, { status: created.status })
          .pipe(map(() => created)),
      ),
    );
  }

  approve(institution: Institution): Observable<Institution> {
    return this.mutate(institution, 'INSTITUTION_APPROVE', () => this.port.approve(institution.id));
  }

  activate(institution: Institution): Observable<Institution> {
    return this.mutate(institution, 'INSTITUTION_ACTIVATE', () => this.port.activate(institution.id));
  }

  suspend(institution: Institution, reason?: string): Observable<Institution> {
    return this.mutate(institution, 'INSTITUTION_SUSPEND', () => this.port.suspend(institution.id, reason), reason);
  }

  revoke(institution: Institution, reason: string): Observable<Institution> {
    return this.mutate(institution, 'INSTITUTION_REVOKE', () => this.port.revoke(institution.id, reason), reason);
  }

  /** Which workflow buttons the back-office should show for a given institution's current status. */
  availableActions(institution: Institution): readonly InstitutionWorkflowActionName[] {
    return availableActions(institution.status ?? 'ACTIVE');
  }

  private mutate(
    before: Institution,
    action: string,
    call: () => Observable<Institution>,
    reason?: string | null,
  ): Observable<Institution> {
    return call().pipe(
      switchMap((after) =>
        this.auditService
          .log(action, { type: ENTITY_TYPE, id: before.id }, { status: before.status }, { status: after.status }, reason ?? null)
          .pipe(map(() => after)),
      ),
    );
  }
}
