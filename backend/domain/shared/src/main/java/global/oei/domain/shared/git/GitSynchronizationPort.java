package global.oei.domain.shared.git;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link GitSynchronization}, most recent first.
 */
public interface GitSynchronizationPort {

    GitSynchronization save(GitSynchronization synchronization);

    Optional<GitSynchronization> findById(String id);

    List<GitSynchronization> findAll();

    Optional<GitSynchronization> findLatest();
}
