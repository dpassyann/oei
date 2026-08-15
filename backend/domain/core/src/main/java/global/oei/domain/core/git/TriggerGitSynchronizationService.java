package global.oei.domain.core.git;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.git.GitSyncedFile;
import global.oei.domain.shared.git.GitSyncedFilePort;
import global.oei.domain.shared.git.GitSynchronization;
import global.oei.domain.shared.git.GitSynchronizationPort;
import global.oei.domain.shared.git.GitSynchronizationStatus;
import global.oei.domain.shared.git.TriggerGitSynchronizationUseCase;

/**
 * Mocked Git synchronization: no real Git client (clone/pull/checkout) is wired in this
 * iteration — there is no normative repository actually reachable yet. Every run therefore
 * completes synchronously as {@link GitSynchronizationStatus#SUCCESS} and records a small,
 * clearly-labelled simulated set of Markdown files (never a real fetch, never a write back to
 * any upstream repository), same mocking posture as {@code RenderCvService}/
 * {@code CreateWalletPassService}.
 */
public class TriggerGitSynchronizationService implements TriggerGitSynchronizationUseCase {

    private final GitSynchronizationPort gitSynchronizationPort;
    private final GitSyncedFilePort gitSyncedFilePort;

    public TriggerGitSynchronizationService(
            final GitSynchronizationPort gitSynchronizationPort, final GitSyncedFilePort gitSyncedFilePort) {
        this.gitSynchronizationPort = Objects.requireNonNull(gitSynchronizationPort, "gitSynchronizationPort must not be null");
        this.gitSyncedFilePort = Objects.requireNonNull(gitSyncedFilePort, "gitSyncedFilePort must not be null");
    }

    @Override
    public GitSynchronization execute() {
        final String syncId = UUID.randomUUID().toString();
        final Instant now = Instant.now();
        final String commitSha = "mock" + Integer.toHexString(syncId.hashCode());
        final List<GitSyncedFile> files = List.of(
                new GitSyncedFile(syncId, "statuts/statuts.md", "main", commitSha, "---\ntitle: Statuts\n---\n(contenu simulé)"),
                new GitSyncedFile(syncId, "reglement/reglement-interieur.md", "main", commitSha,
                        "---\ntitle: Règlement intérieur\n---\n(contenu simulé)"));
        gitSyncedFilePort.saveAll(files);
        final GitSynchronization synchronization =
                new GitSynchronization(syncId, now, now, GitSynchronizationStatus.SUCCESS, files.size(), List.of());
        return gitSynchronizationPort.save(synchronization);
    }
}
