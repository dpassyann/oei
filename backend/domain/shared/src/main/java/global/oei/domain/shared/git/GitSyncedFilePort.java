package global.oei.domain.shared.git;

import java.util.List;

/**
 * Outbound port for {@link GitSyncedFile}s produced by a {@link GitSynchronization}.
 */
public interface GitSyncedFilePort {

    List<GitSyncedFile> saveAll(List<GitSyncedFile> files);

    List<GitSyncedFile> findBySynchronizationId(String synchronizationId);
}
