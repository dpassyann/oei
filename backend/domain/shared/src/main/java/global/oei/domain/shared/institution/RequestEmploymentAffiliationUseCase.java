package global.oei.domain.shared.institution;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: a member requests to be affiliated with an institution.
 */
public interface RequestEmploymentAffiliationUseCase {

    EmploymentAffiliation execute(MemberId memberId, InstitutionId institutionId);
}
