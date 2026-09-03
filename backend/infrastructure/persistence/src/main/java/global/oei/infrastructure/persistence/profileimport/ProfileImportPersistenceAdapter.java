package global.oei.infrastructure.persistence.profileimport;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

/**
 * Implements {@link ProfileImportPort} by mapping {@link ProfileImport} field-by-field onto
 * {@link ProfileImportEntity} — no jsonb blob needed here, unlike {@code CvPersistenceAdapter}
 * (see that entity's Javadoc): this aggregate has no nested collections.
 */
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileImportPersistenceAdapter implements ProfileImportPort {

    private final ProfileImportRepository repository;

    @Override
    @Transactional
    public ProfileImport save(final ProfileImport profileImport) {
        final ProfileImportEntity entity = new ProfileImportEntity(
                UUID.fromString(profileImport.id()),
                profileImport.memberId().value(),
                profileImport.source().name(),
                profileImport.status().name(),
                profileImport.createdAt(),
                profileImport.updatedAt(),
                profileImport.errorCode());
        repository.save(entity);
        return profileImport;
    }

    @Override
    public Optional<ProfileImport> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(ProfileImportPersistenceAdapter::toDomain);
    }

    @Override
    public Optional<ProfileImport> findLatestByMemberId(final MemberId memberId) {
        return repository.findFirstByMemberIdOrderByStatusUpdatedAtDesc(memberId.value())
                .map(ProfileImportPersistenceAdapter::toDomain);
    }

    private static ProfileImport toDomain(final ProfileImportEntity entity) {
        return new ProfileImport(
                entity.getId().toString(),
                new MemberId(entity.getMemberId()),
                ProfileImportSource.valueOf(entity.getSource()),
                ProfileImportStatus.valueOf(entity.getStatus()),
                entity.getStartedAt(),
                entity.getStatusUpdatedAt(),
                entity.getErrorCode(),
                null);
    }
}
