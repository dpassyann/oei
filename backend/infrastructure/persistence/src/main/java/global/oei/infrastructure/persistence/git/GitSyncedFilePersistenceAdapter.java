package global.oei.infrastructure.persistence.git;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.git.GitSyncedFile;
import global.oei.domain.shared.git.GitSyncedFilePort;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GitSyncedFilePersistenceAdapter implements GitSyncedFilePort {

    private final GitSyncedFileRepository repository;

    @Override
    @Transactional
    public List<GitSyncedFile> saveAll(final List<GitSyncedFile> files) {
        final List<GitSyncedFileEntity> entities = files.stream()
                .map(file -> new GitSyncedFileEntity(
                        UUID.randomUUID(), UUID.fromString(file.synchronizationId()), file.path(), file.gitRef(), file.commitSha(),
                        file.rawContent()))
                .toList();
        repository.saveAll(entities);
        return files;
    }

    @Override
    public List<GitSyncedFile> findBySynchronizationId(final String synchronizationId) {
        return repository.findBySynchronizationId(UUID.fromString(synchronizationId)).stream()
                .map(entity -> new GitSyncedFile(
                        entity.getSynchronizationId().toString(), entity.getPath(), entity.getGitRef(), entity.getCommitSha(),
                        entity.getRawContent()))
                .toList();
    }
}
