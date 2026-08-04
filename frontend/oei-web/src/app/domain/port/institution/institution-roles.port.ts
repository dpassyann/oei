import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionMembership } from '../../model/institution/institution-membership';
import { InstitutionRole } from '../../model/institution/institution-role';

// Rôles internes de l'équipe institutionnelle — `GET/PUT/DELETE /api/institution/v1/roles*`.
export interface InstitutionRolesPort {
  listRoleAssignments(): Observable<InstitutionMembership[]>;
  updateRoleAssignment(memberId: string, role: InstitutionRole): Observable<InstitutionMembership>;
  removeRoleAssignment(memberId: string): Observable<void>;
}

export const INSTITUTION_ROLES_PORT = new InjectionToken<InstitutionRolesPort>('InstitutionRolesPort');
