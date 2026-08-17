package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.InstitutionBadgeProposal;
import global.oei.domain.shared.institution.InstitutionBadgeProposalPort;
import global.oei.domain.shared.institution.InstitutionBadgeProposalStatus;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.member.MemberId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionBadgeProposalPersistenceAdapter implements InstitutionBadgeProposalPort {

    private final InstitutionBadgeProposalRepository repository;

    @Override
    public List<InstitutionBadgeProposal> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionId(institutionId.value()).stream()
                .map(InstitutionBadgeProposalPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public InstitutionBadgeProposal save(final InstitutionBadgeProposal proposal) {
        final InstitutionBadgeProposalEntity entity = new InstitutionBadgeProposalEntity(
                UUID.fromString(proposal.id()), proposal.institutionId().value(), proposal.memberId().value(),
                proposal.proposedBadgeCode(), proposal.justification(), proposal.status().name());
        repository.save(entity);
        return proposal;
    }

    private static InstitutionBadgeProposal toDomain(final InstitutionBadgeProposalEntity entity) {
        return new InstitutionBadgeProposal(
                entity.getId().toString(), new InstitutionId(entity.getInstitutionId()), new MemberId(entity.getMemberId()),
                entity.getProposedBadgeCode(), entity.getJustification(), InstitutionBadgeProposalStatus.valueOf(entity.getStatus()));
    }
}
