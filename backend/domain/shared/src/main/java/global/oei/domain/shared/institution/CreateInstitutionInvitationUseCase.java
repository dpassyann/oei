package global.oei.domain.shared.institution;

/**
 * Inbound port: create an {@link InstitutionInvitation}.
 */
public interface CreateInstitutionInvitationUseCase {

    InstitutionInvitation execute(InstitutionId institutionId, String email, InstitutionRole role, String invitedBy);
}
