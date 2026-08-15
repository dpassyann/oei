package global.oei.domain.shared.verification;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link VerificationRequest}.
 */
public interface VerificationRequestPort {

    List<VerificationRequest> findByMemberId(MemberId memberId);

    Optional<VerificationRequest> findById(String id);

    VerificationRequest save(VerificationRequest request);
}
