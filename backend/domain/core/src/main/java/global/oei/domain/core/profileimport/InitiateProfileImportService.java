package global.oei.domain.core.profileimport;

import java.time.Instant;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profileimport.InitiateProfileImportUseCase;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

/**
 * Creates a new {@link ProfileImport} session and immediately advances it to
 * {@link ProfileImportStatus#DOCUMENT_UPLOADED} — see {@link InitiateProfileImportUseCase}'s
 * Javadoc for why there is no observable {@code CREATED} moment.
 */
@Slf4j
@RequiredArgsConstructor
public class InitiateProfileImportService implements InitiateProfileImportUseCase {

    private final ProfileImportPort profileImportPort;

    @Override
    public ProfileImport execute(final MemberId memberId, final ProfileImportSource source) {
        log.debug("InitiateProfileImportService: execute called");
        final Instant now = Instant.now();
        final ProfileImport uploaded = ProfileImport
                .create(UUID.randomUUID().toString(), memberId, source, now)
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, now, null);
        return profileImportPort.save(uploaded);
    }
}
