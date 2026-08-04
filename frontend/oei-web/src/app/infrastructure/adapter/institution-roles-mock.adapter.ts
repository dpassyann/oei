import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { InstitutionRolesPort } from '../../domain/port/institution/institution-roles.port';
import { createInstitutionMembership, InstitutionMembership } from '../../domain/model/institution/institution-membership';
import { InstitutionRole } from '../../domain/model/institution/institution-role';
import { DEMO_MEMBERSHIPS } from './institution-demo-data';

@Service()
export class InstitutionRolesMockAdapter implements InstitutionRolesPort {
  private memberships: InstitutionMembership[] = [...DEMO_MEMBERSHIPS];

  listRoleAssignments(): Observable<InstitutionMembership[]> {
    return of(this.memberships);
  }

  updateRoleAssignment(memberId: string, role: InstitutionRole): Observable<InstitutionMembership> {
    const existing = this.memberships.find((membership) => membership.memberId === memberId);
    if (!existing) {
      return throwError(() => new Error(`Institution membership not found: ${memberId}`));
    }
    const updated = createInstitutionMembership({ ...existing, role });
    this.memberships = this.memberships.map((membership) => (membership.memberId === memberId ? updated : membership));
    return of(updated);
  }

  removeRoleAssignment(memberId: string): Observable<void> {
    this.memberships = this.memberships.filter((membership) => membership.memberId !== memberId);
    return of(undefined);
  }
}
