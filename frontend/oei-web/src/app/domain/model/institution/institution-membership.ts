import { InstitutionRole } from './institution-role';

// Affectation d'un rôle institutionnel interne (équipe institutionnelle) à un membre —
// distinct de `MemberInstitutionAffiliation`, qui rattache un employé simple à l'institution
// sans rôle de gestion.
export interface InstitutionMembership {
  readonly memberId: string;
  readonly institutionId: string;
  readonly role: InstitutionRole;
  readonly grantedAt: string;
  readonly grantedBy: string;
}

export function createInstitutionMembership(fields: InstitutionMembership): InstitutionMembership {
  return Object.freeze({ ...fields });
}
