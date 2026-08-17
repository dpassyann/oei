package global.oei.domain.core.institution;

import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.institution.CreateInstitutionBadgeProposalUseCase;
import global.oei.domain.shared.institution.InstitutionBadgeProposal;
import global.oei.domain.shared.institution.InstitutionBadgeProposalPort;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.member.MemberId;

/**
 * Default {@code CreateInstitutionBadgeProposalUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateInstitutionBadgeProposalService implements CreateInstitutionBadgeProposalUseCase {

    @NonNull
    private final InstitutionBadgeProposalPort institutionBadgeProposalPort;

    @Override
    public InstitutionBadgeProposal execute(
            final InstitutionId institutionId, final MemberId memberId, final String proposedBadgeCode, final String justification) {
        log.debug("CreateInstitutionBadgeProposalService: execute called");
        final InstitutionBadgeProposal proposal = new InstitutionBadgeProposal(
                UUID.randomUUID().toString(), institutionId, memberId, proposedBadgeCode, justification,
                InstitutionBadgeProposalStatus.PENDING);
        return institutionBadgeProposalPort.save(proposal);
    }
}
