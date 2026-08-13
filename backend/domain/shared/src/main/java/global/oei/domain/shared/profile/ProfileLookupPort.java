package global.oei.domain.shared.profile;

import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for reading/replacing a member's {@link ProfessionalProfile}.
 */
public interface ProfileLookupPort {

    Optional<ProfessionalProfile> findByMemberId(MemberId memberId);

    ProfessionalProfile save(ProfessionalProfile profile);
}
