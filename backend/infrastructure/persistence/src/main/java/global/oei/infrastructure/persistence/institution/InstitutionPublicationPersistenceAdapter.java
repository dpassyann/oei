package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionPublication;
import global.oei.domain.shared.institution.InstitutionPublicationPort;
import global.oei.domain.shared.institution.InstitutionPublicationType;
import global.oei.domain.shared.institution.PublicationWorkflowStatus;
import global.oei.domain.shared.member.MemberId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionPublicationPersistenceAdapter implements InstitutionPublicationPort {

    private final InstitutionPublicationRepository repository;

    @Override
    public List<InstitutionPublication> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionId(institutionId.value()).stream()
                .map(InstitutionPublicationPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public List<InstitutionPublication> findPublishedByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionIdAndStatus(institutionId.value(), PublicationWorkflowStatus.PUBLISHED.name()).stream()
                .map(InstitutionPublicationPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<InstitutionPublication> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(InstitutionPublicationPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public InstitutionPublication save(final InstitutionPublication publication) {
        final InstitutionPublicationEntity entity = new InstitutionPublicationEntity(
                UUID.fromString(publication.id()), publication.institutionId().value(), publication.type().name(),
                publication.title(), publication.body(), publication.status().name(),
                publication.authorMemberId() == null ? null : publication.authorMemberId().value(), publication.submittedAt(),
                publication.publishedAt());
        repository.save(entity);
        return publication;
    }

    private static InstitutionPublication toDomain(final InstitutionPublicationEntity entity) {
        return new InstitutionPublication(
                entity.getId().toString(), new InstitutionId(entity.getInstitutionId()),
                InstitutionPublicationType.valueOf(entity.getType()), entity.getTitle(), entity.getBody(),
                PublicationWorkflowStatus.valueOf(entity.getStatus()),
                entity.getAuthorMemberId() == null ? null : new MemberId(entity.getAuthorMemberId()), entity.getSubmittedAt(),
                entity.getPublishedAt());
    }
}
