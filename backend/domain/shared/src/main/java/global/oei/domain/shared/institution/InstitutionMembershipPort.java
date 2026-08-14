package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link InstitutionMembership}.
 */
public interface InstitutionMembershipPort {

    List<InstitutionMembership> findByInstitutionId(InstitutionId institutionId);

    Optional<InstitutionMembership> findByInstitutionIdAndMemberId(InstitutionId institutionId, MemberId memberId);

    InstitutionMembership save(InstitutionMembership membership);

    void delete(InstitutionId institutionId, MemberId memberId);
}
