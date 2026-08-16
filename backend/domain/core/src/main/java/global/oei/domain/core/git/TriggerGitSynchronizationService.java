package global.oei.domain.core.git;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import global.oei.domain.shared.git.GitSyncedFile;
import global.oei.domain.shared.git.GitSyncedFilePort;
import global.oei.domain.shared.git.GitSynchronization;
import global.oei.domain.shared.git.GitSynchronizationPort;
import global.oei.domain.shared.git.GitSynchronizationStatus;
import global.oei.domain.shared.git.TriggerGitSynchronizationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Mocked Git synchronization: no real Git client (clone/pull/checkout) is wired in this
 * iteration — there is no normative repository actually reachable yet. Every run therefore
 * completes synchronously as {@link GitSynchronizationStatus#SUCCESS} and records a small,
 * clearly-labelled simulated set of Markdown files (never a real fetch, never a write back to
 * any upstream repository), same mocking posture as {@code RenderCvService}/
 * {@code CreateWalletPassService}.
 */
@Slf4j
@RequiredArgsConstructor
public class TriggerGitSynchronizationService implements TriggerGitSynchronizationUseCase {

    @NonNull
    private final GitSynchronizationPort gitSynchronizationPort;
    @NonNull
    private final GitSyncedFilePort gitSyncedFilePort;

    @Override
    public GitSynchronization execute() {
        log.debug("triggerGitSynchronization: start");
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
        log.info("triggerGitSynchronization: completed syncId={} files={}", syncId, files.size());
        return gitSynchronizationPort.save(synchronization);
    }
}
