package global.oei.domain.shared.profileimport;

import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for persisting/reading {@link ProfileImport} sessions.
 */
public interface ProfileImportPort {

    ProfileImport save(ProfileImport profileImport);

    Optional<ProfileImport> findById(String id);

    /**
     * @return the most recently updated {@link ProfileImport} session for {@code memberId},
     *         empty when the member never started one. Used by the bootstrap read-model to
     *         project the CV-import pipeline status alongside {@code profileStatus}.
     */
    Optional<ProfileImport> findLatestByMemberId(MemberId memberId);
}
