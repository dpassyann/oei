package global.oei.domain.shared.institution;

import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * An institution's proposal to recognize an affiliated member (training, contribution,
 * mentoring, publication, internal distinction). Subject to the member's own acceptance;
 * only a subsequent, separate OEI decision can turn this into an official OEI badge award —
 * this proposal by itself never awards one (see the operation's own contract summary).
 */
public record InstitutionBadgeProposal(
        String id,
        InstitutionId institutionId,
        MemberId memberId,
        String proposedBadgeCode,
        String justification,
        InstitutionBadgeProposalStatus status) {

    public InstitutionBadgeProposal {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(proposedBadgeCode, "proposedBadgeCode must not be null");
        Objects.requireNonNull(justification, "justification must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }
}
