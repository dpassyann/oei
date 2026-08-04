export type InstitutionBadgeProposalStatus = 'PENDING' | 'ACCEPTED_BY_MEMBER' | 'DECLINED_BY_MEMBER' | 'REJECTED_BY_OEI' | 'AWARDED';

// L'institution propose une reconnaissance (formation, contribution, mentorat, publication,
// distinction interne) à un membre affilié — soumise à acceptation du membre. L'OEI reste
// seul décideur pour un badge OEI officiel (voir doc 03 §"Reconnaissance").
export interface InstitutionBadgeProposal {
  readonly id: string;
  readonly institutionId: string;
  readonly memberId: string;
  readonly proposedBadgeCode: string;
  readonly justification: string;
  readonly status: InstitutionBadgeProposalStatus;
}

export function createInstitutionBadgeProposal(fields: InstitutionBadgeProposal): InstitutionBadgeProposal {
  return Object.freeze({ ...fields });
}
