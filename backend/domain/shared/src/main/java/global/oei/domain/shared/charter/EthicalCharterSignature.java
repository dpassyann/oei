package global.oei.domain.shared.charter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.member.MemberId;

/**
 * Records that a member signed a given version of the OEI ethical charter.
 */
public record EthicalCharterSignature(UUID id, MemberId memberId, String version, Instant signedAt) {

    public EthicalCharterSignature {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(version, "version must not be null");
        if (version.isBlank()) {
            throw new IllegalArgumentException("version must not be blank");
        }
        Objects.requireNonNull(signedAt, "signedAt must not be null");
    }
}
