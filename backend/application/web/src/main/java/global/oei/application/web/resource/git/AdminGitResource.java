package global.oei.application.web.resource.git;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminGitApi;
import global.oei.application.web.model.GitSyncedFileDTO;
import global.oei.application.web.model.GitSynchronizationDTO;
import global.oei.application.web.resource.git.mapper.GitSynchronizationDtoMapper;
import global.oei.domain.shared.git.GitSyncedFilePort;
import global.oei.domain.shared.git.GitSynchronizationPort;
import global.oei.domain.shared.git.TriggerGitSynchronizationUseCase;

/**
 * Implements every operation of {@link AdminGitApi}: no stub left on this interface. See
 * {@code TriggerGitSynchronizationService}'s Javadoc for the mocked, read-only synchronization
 * posture.
 */
@RestController
@RequiredArgsConstructor
public class AdminGitResource implements AdminGitApi {

    private final TriggerGitSynchronizationUseCase triggerGitSynchronizationUseCase;
    private final GitSynchronizationPort gitSynchronizationPort;
    private final GitSyncedFilePort gitSyncedFilePort;

    @Override
    public ResponseEntity<GitSynchronizationDTO> triggerGitSynchronization() {
        final var synchronization = triggerGitSynchronizationUseCase.execute();
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(GitSynchronizationDtoMapper.toDto(synchronization));
    }

    @Override
    public ResponseEntity<List<GitSynchronizationDTO>> listGitSynchronizations() {
        return ResponseEntity.ok(gitSynchronizationPort.findAll().stream().map(GitSynchronizationDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<GitSynchronizationDTO> getGitSynchronization(final String id) {
        return gitSynchronizationPort.findById(id).map(GitSynchronizationDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<GitSyncedFileDTO>> listLatestGitSyncedFiles() {
        final List<GitSyncedFileDTO> files = gitSynchronizationPort.findLatest()
                .map(synchronization -> gitSyncedFilePort.findBySynchronizationId(synchronization.id()))
                .orElseGet(List::of)
                .stream()
                .map(GitSynchronizationDtoMapper::toDto)
                .toList();
        return ResponseEntity.ok(files);
    }
}
