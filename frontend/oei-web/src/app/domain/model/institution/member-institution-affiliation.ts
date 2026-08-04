export type MemberInstitutionAffiliationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ENDED';

// Rattachement d'un membre individuel (employé) à une institution — distinct de
// `InstitutionMembership` (rôle de gestion interne). Voir doc 03 §"Employés membres" :
// l'institution peut approuver/rejeter/mettre fin, jamais modifier le CV personnel du membre.
export interface MemberInstitutionAffiliation {
  readonly id: string;
  readonly memberId: string;
  readonly memberDisplayName: string;
  readonly institutionId: string;
  readonly status: MemberInstitutionAffiliationStatus;
  readonly requestedAt: string;
  readonly decidedAt: string | null;
  readonly decidedBy: string | null;
  readonly emailDomainVerified: boolean;
}

export function createMemberInstitutionAffiliation(fields: MemberInstitutionAffiliation): MemberInstitutionAffiliation {
  return Object.freeze({ ...fields });
}
