package global.oei.domain.core.profileimport;

import java.time.Instant;
import java.util.NoSuchElementException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.profileimport.AdvanceProfileImportUseCase;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

/**
 * Implements the internal/test-only seam documented on {@link AdvanceProfileImportUseCase}:
 * loads the session, delegates transition legality entirely to
 * {@link ProfileImport#transitionTo}, then persists the result.
 */
@Slf4j
@RequiredArgsConstructor
public class AdvanceProfileImportService implements AdvanceProfileImportUseCase {

    private final ProfileImportPort profileImportPort;

    @Override
    public ProfileImport execute(final String importId, final ProfileImportStatus targetStatus, final String errorCode) {
        log.debug("AdvanceProfileImportService: execute called");
        final ProfileImport current = profileImportPort.findById(importId)
                .orElseThrow(() -> new NoSuchElementException("No ProfileImport found for id " + importId));
        final ProfileImport advanced = current.transitionTo(targetStatus, Instant.now(), errorCode);
        return profileImportPort.save(advanced);
    }
}
