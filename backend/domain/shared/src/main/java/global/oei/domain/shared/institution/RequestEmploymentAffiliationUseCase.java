package global.oei.domain.shared.institution;

import global.oei.domain.shared.member.MemberId;

public interface RequestEmploymentAffiliationUseCase {

    EmploymentAffiliation execute(MemberId memberId, InstitutionId institutionId);
}
