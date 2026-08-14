package global.oei.domain.core.institution;

import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.institution.CreateInstitutionBadgeProposalUseCase;
import global.oei.domain.shared.institution.InstitutionBadgeProposal;
import global.oei.domain.shared.institution.InstitutionBadgeProposalPort;
import global.oei.domain.shared.institution.InstitutionBadgeProposalStatus;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.member.MemberId;

/**
 * Default {@code CreateInstitutionBadgeProposalUseCase} implementation.
 */
public class CreateInstitutionBadgeProposalService implements CreateInstitutionBadgeProposalUseCase {

    private final InstitutionBadgeProposalPort institutionBadgeProposalPort;

    public CreateInstitutionBadgeProposalService(final InstitutionBadgeProposalPort institutionBadgeProposalPort) {
        this.institutionBadgeProposalPort =
                Objects.requireNonNull(institutionBadgeProposalPort, "institutionBadgeProposalPort must not be null");
    }

    @Override
    public InstitutionBadgeProposal execute(
            final InstitutionId institutionId, final MemberId memberId, final String proposedBadgeCode, final String justification) {
        final InstitutionBadgeProposal proposal = new InstitutionBadgeProposal(
                UUID.randomUUID().toString(), institutionId, memberId, proposedBadgeCode, justification,
                InstitutionBadgeProposalStatus.PENDING);
        return institutionBadgeProposalPort.save(proposal);
    }
}
