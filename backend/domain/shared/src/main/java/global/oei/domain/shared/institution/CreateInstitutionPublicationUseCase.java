package global.oei.domain.shared.institution;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: create a draft {@link InstitutionPublication}.
 */
public interface CreateInstitutionPublicationUseCase {

    InstitutionPublication execute(
            InstitutionId institutionId, InstitutionPublicationType type, String title, String body, MemberId authorMemberId);
}
