package global.oei.domain.shared.git;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * A read-only synchronization run against the normative Git repository (statuts, règlement,
 * chartes...). See {@code TriggerGitSynchronizationService}'s Javadoc: no real Git client
 * (clone/pull) is wired in this iteration, this is entirely mocked — never a write to the
 * upstream repository, in keeping with the operation's "read-only sync" contract summary.
 */
public record GitSynchronization(
        String id, Instant startedAt, Instant finishedAt, GitSynchronizationStatus status, int commitsProcessed, List<String> errors) {

    public GitSynchronization {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(status, "status must not be null");
        errors = List.copyOf(errors == null ? List.of() : errors);
    }
}
