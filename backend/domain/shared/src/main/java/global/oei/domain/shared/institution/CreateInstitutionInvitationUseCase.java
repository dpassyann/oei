package global.oei.domain.shared.institution;

public interface CreateInstitutionInvitationUseCase {

    InstitutionInvitation execute(InstitutionId institutionId, String email, InstitutionRole role, String invitedBy);
}
