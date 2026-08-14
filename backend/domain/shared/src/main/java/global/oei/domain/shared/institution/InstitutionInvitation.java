package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

/**
 * An institution's invitation for an employee to join its team space.
 */
public record InstitutionInvitation(
        String id,
        InstitutionId institutionId,
        String email,
        InstitutionRole role,
        InstitutionInvitationStatus status,
        String invitedBy,
        Instant invitedAt,
        Instant expiresAt) {

    public InstitutionInvitation {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(role, "role must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * @return a new instance with {@link #status()} set to {@link InstitutionInvitationStatus#REVOKED},
     *         or throws if the invitation is not currently {@link InstitutionInvitationStatus#PENDING}
     */
    public InstitutionInvitation revoke() {
        if (status != InstitutionInvitationStatus.PENDING) {
            throw new IllegalStateException("only a PENDING invitation can be revoked, was " + status);
        }
        return new InstitutionInvitation(id, institutionId, email, role, InstitutionInvitationStatus.REVOKED, invitedBy, invitedAt, expiresAt);
    }
}
