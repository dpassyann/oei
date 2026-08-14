package global.oei.domain.shared.certification;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link MemberCertificationGoal}.
 */
public interface CertificationGoalPort {

    List<MemberCertificationGoal> findByMemberId(MemberId memberId);

    /**
     * Upsert by ({@link MemberCertificationGoal#memberId()},
     * {@link MemberCertificationGoal#recognizedCertificationId()}) — one goal entry per
     * member and recognized certification, matching the OpenAPI contract's own upsert
     * semantics for this operation.
     */
    MemberCertificationGoal upsert(MemberCertificationGoal goal);
}
