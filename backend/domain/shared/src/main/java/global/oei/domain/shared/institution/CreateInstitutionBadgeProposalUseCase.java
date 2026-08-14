package global.oei.domain.shared.institution;

import global.oei.domain.shared.member.MemberId;

public interface CreateInstitutionBadgeProposalUseCase {

    InstitutionBadgeProposal execute(InstitutionId institutionId, MemberId memberId, String proposedBadgeCode, String justification);
}
