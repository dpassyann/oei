package global.oei.domain.core.institution;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.institution.CreateInstitutionInvitationUseCase;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionInvitation;
import global.oei.domain.shared.institution.InstitutionInvitationPort;
import global.oei.domain.shared.institution.InstitutionInvitationStatus;
import global.oei.domain.shared.institution.InstitutionRole;

/**
 * Enforces the "always starts PENDING, always expires in 30 days" invariant on every
 * institution invitation.
 */
public class CreateInstitutionInvitationService implements CreateInstitutionInvitationUseCase {

    private static final Duration EXPIRY = Duration.ofDays(30);

    private final InstitutionInvitationPort institutionInvitationPort;

    public CreateInstitutionInvitationService(final InstitutionInvitationPort institutionInvitationPort) {
        this.institutionInvitationPort = Objects.requireNonNull(institutionInvitationPort, "institutionInvitationPort must not be null");
    }

    @Override
    public InstitutionInvitation execute(
            final InstitutionId institutionId, final String email, final InstitutionRole role, final String invitedBy) {
        final Instant now = Instant.now();
        final InstitutionInvitation invitation = new InstitutionInvitation(
                UUID.randomUUID().toString(), institutionId, email, role, InstitutionInvitationStatus.PENDING, invitedBy, now,
                now.plus(EXPIRY));
        return institutionInvitationPort.save(invitation);
    }
}
