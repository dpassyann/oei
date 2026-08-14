package global.oei.domain.shared.institution;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: create an {@link InstitutionBadgeProposal}.
 */
public interface CreateInstitutionBadgeProposalUseCase {

    InstitutionBadgeProposal execute(InstitutionId institutionId, MemberId memberId, String proposedBadgeCode, String justification);
}
