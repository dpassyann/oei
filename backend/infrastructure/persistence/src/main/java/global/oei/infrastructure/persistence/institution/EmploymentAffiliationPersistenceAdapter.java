package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.EmploymentAffiliation;
import global.oei.domain.shared.institution.EmploymentAffiliationPort;
import global.oei.domain.shared.institution.EmploymentAffiliationStatus;
import global.oei.domain.shared.institution.EmploymentAffiliationVerificationMethod;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.member.MemberId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmploymentAffiliationPersistenceAdapter implements EmploymentAffiliationPort {

    private final EmploymentAffiliationRepository repository;

    @Override
    public List<EmploymentAffiliation> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream().map(EmploymentAffiliationPersistenceAdapter::toDomain).toList();
    }

    @Override
    public List<EmploymentAffiliation> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionId(institutionId.value()).stream()
                .map(EmploymentAffiliationPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public List<EmploymentAffiliation> findByInstitutionIdAndStatus(final InstitutionId institutionId, final EmploymentAffiliationStatus status) {
        return repository.findByInstitutionIdAndStatus(institutionId.value(), status.name()).stream()
                .map(EmploymentAffiliationPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<EmploymentAffiliation> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(EmploymentAffiliationPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public EmploymentAffiliation save(final EmploymentAffiliation affiliation) {
        final EmploymentAffiliationEntity entity = new EmploymentAffiliationEntity(
                UUID.fromString(affiliation.id()), affiliation.memberId().value(), affiliation.institutionId().value(),
                affiliation.verificationMethod().name(), affiliation.status().name(), affiliation.requestedAt(),
                affiliation.startedAt(), affiliation.endedAt(), affiliation.decidedAt(), affiliation.decidedBy());
        repository.save(entity);
        return affiliation;
    }

    private static EmploymentAffiliation toDomain(final EmploymentAffiliationEntity entity) {
        return new EmploymentAffiliation(
                entity.getId().toString(), new MemberId(entity.getMemberId()), new InstitutionId(entity.getInstitutionId()),
                EmploymentAffiliationVerificationMethod.valueOf(entity.getVerificationMethod()),
                EmploymentAffiliationStatus.valueOf(entity.getStatus()), entity.getRequestedAt(), entity.getStartedAt(),
                entity.getEndedAt(), entity.getDecidedAt(), entity.getDecidedBy());
    }
}
