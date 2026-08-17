package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionOpportunity;
import global.oei.domain.shared.institution.InstitutionOpportunityPort;
import global.oei.domain.shared.institution.InstitutionOpportunityStatus;
import global.oei.domain.shared.institution.InstitutionOpportunityType;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionOpportunityPersistenceAdapter implements InstitutionOpportunityPort {

    private final InstitutionOpportunityRepository repository;

    @Override
    public List<InstitutionOpportunity> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionId(institutionId.value()).stream()
                .map(InstitutionOpportunityPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public List<InstitutionOpportunity> findPublishedByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionIdAndStatus(institutionId.value(), InstitutionOpportunityStatus.PUBLISHED.name()).stream()
                .map(InstitutionOpportunityPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<InstitutionOpportunity> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(InstitutionOpportunityPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public InstitutionOpportunity save(final InstitutionOpportunity opportunity) {
        final InstitutionOpportunityEntity entity = new InstitutionOpportunityEntity(
                UUID.fromString(opportunity.id()), opportunity.institutionId().value(), opportunity.type().name(),
                opportunity.title(), opportunity.description(), opportunity.expiresAt(), opportunity.status().name(),
                opportunity.publishedAt());
        repository.save(entity);
        return opportunity;
    }

    private static InstitutionOpportunity toDomain(final InstitutionOpportunityEntity entity) {
        return new InstitutionOpportunity(
                entity.getId().toString(), new InstitutionId(entity.getInstitutionId()),
                InstitutionOpportunityType.valueOf(entity.getType()), entity.getTitle(), entity.getDescription(),
                entity.getExpiresAt(), InstitutionOpportunityStatus.valueOf(entity.getStatus()), entity.getPublishedAt());
    }
}
