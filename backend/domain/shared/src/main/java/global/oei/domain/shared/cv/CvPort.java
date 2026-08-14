package global.oei.domain.shared.cv;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for reading/replacing a member's {@link Cv} aggregates (see {@link Cv}'s
 * Javadoc for why each CV is persisted wholesale).
 */
public interface CvPort {

    Cv save(Cv cv);

    Optional<Cv> findById(String id);

    List<Cv> findByMemberId(MemberId memberId);
}
