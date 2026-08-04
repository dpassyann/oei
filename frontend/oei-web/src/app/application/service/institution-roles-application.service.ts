import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_ROLES_PORT } from '../../domain/port/institution/institution-roles.port';
import { InstitutionMembership } from '../../domain/model/institution/institution-membership';
import { InstitutionRole } from '../../domain/model/institution/institution-role';

@Service()
export class InstitutionRolesApplicationService {
  private readonly port = inject(INSTITUTION_ROLES_PORT);

  listRoleAssignments(): Observable<InstitutionMembership[]> {
    return this.port.listRoleAssignments();
  }

  updateRoleAssignment(memberId: string, role: InstitutionRole): Observable<InstitutionMembership> {
    return this.port.updateRoleAssignment(memberId, role);
  }

  removeRoleAssignment(memberId: string): Observable<void> {
    return this.port.removeRoleAssignment(memberId);
  }
}
