package global.oei.domain.shared.certification;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link Certification}.
 */
public interface CertificationPort {

    List<Certification> findByMemberId(MemberId memberId);

    Optional<Certification> findById(String id);

    Certification save(Certification certification);
}
