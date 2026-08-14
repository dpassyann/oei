package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

public interface EmploymentAffiliationPort {

    List<EmploymentAffiliation> findByMemberId(MemberId memberId);

    List<EmploymentAffiliation> findByInstitutionId(InstitutionId institutionId);

    List<EmploymentAffiliation> findByInstitutionIdAndStatus(InstitutionId institutionId, EmploymentAffiliationStatus status);

    Optional<EmploymentAffiliation> findById(String id);

    EmploymentAffiliation save(EmploymentAffiliation affiliation);
}
