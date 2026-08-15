package global.oei.domain.shared.git;

/**
 * Inbound port: trigger a read-only synchronization from the normative Git repository.
 * Idempotent per the operation's OpenAPI summary (each call simply records a brand-new
 * {@link GitSynchronization} run; no distinct "already up to date" short-circuit is needed
 * since this is mocked — see {@code TriggerGitSynchronizationService}'s Javadoc).
 */
public interface TriggerGitSynchronizationUseCase {

    GitSynchronization execute();
}
