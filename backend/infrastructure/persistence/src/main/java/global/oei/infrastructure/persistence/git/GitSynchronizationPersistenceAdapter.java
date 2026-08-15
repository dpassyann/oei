package global.oei.infrastructure.persistence.git;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.git.GitSynchronization;
import global.oei.domain.shared.git.GitSynchronizationPort;
import global.oei.domain.shared.git.GitSynchronizationStatus;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GitSynchronizationPersistenceAdapter implements GitSynchronizationPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final GitSynchronizationRepository repository;

    @Override
    @Transactional
    public GitSynchronization save(final GitSynchronization synchronization) {
        final GitSynchronizationEntity entity = new GitSynchronizationEntity(
                UUID.fromString(synchronization.id()), synchronization.startedAt(), synchronization.finishedAt(),
                synchronization.status().name(), synchronization.commitsProcessed(), toJson(synchronization.errors()));
        repository.save(entity);
        return synchronization;
    }

    @Override
    public Optional<GitSynchronization> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(GitSynchronizationPersistenceAdapter::toDomain);
    }

    @Override
    public List<GitSynchronization> findAll() {
        return repository.findAllByOrderByStartedAtDesc().stream().map(GitSynchronizationPersistenceAdapter::toDomain).toList();
    }

    @Override
    public Optional<GitSynchronization> findLatest() {
        return repository.findAllByOrderByStartedAtDesc().stream().findFirst().map(GitSynchronizationPersistenceAdapter::toDomain);
    }

    @SneakyThrows
    private static GitSynchronization toDomain(final GitSynchronizationEntity entity) {
        final List<String> errors = entity.getErrorsJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(
                        entity.getErrorsJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        return new GitSynchronization(
                entity.getId().toString(), entity.getStartedAt(), entity.getFinishedAt(),
                GitSynchronizationStatus.valueOf(entity.getStatus()), entity.getCommitsProcessed(), errors);
    }

    @SneakyThrows
    private static String toJson(final List<String> errors) {
        return OBJECT_MAPPER.writeValueAsString(errors);
    }
}
