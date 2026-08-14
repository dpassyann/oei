package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member-submitted proposal for a new {@link Event}. Workflow: {@code DRAFT -> SUBMITTED
 * -> AI_PRECHECK -> MODERATOR_REVIEW -> APPROVED -> PUBLISHED} (only {@code submit} and
 * {@code approve} are exposed as operations in this iteration — the AI precheck step is
 * folded into {@link #submit(Instant)} itself, always non-blocking and never
 * auto-publishing, per the operation's own contract summary).
 */
public record EventProposal(
        String id,
        MemberId authorId,
        String title,
        String description,
        EventType type,
        Instant startAt,
        Instant endAt,
        String timezone,
        EventLocation location,
        String imageUrl,
        EventProposalStatus status,
        Instant submittedAt,
        EventProposalAiPrecheck aiPrecheck,
        String moderatorNote) {

    public EventProposal {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(authorId, "authorId must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * @return a new instance moved straight to {@link EventProposalStatus#MODERATOR_REVIEW}
     *         (folding {@code SUBMITTED}/{@code AI_PRECHECK} into this single, always-passing,
     *         never-blocking mocked precheck — see this class's Javadoc)
     */
    public EventProposal submit(final Instant now) {
        return new EventProposal(
                id, authorId, title, description, type, startAt, endAt, timezone, location, imageUrl,
                EventProposalStatus.MODERATOR_REVIEW, now, new EventProposalAiPrecheck(true, "Précheck automatique non bloquant.", now),
                moderatorNote);
    }

    /**
     * @return a new instance moved to {@link EventProposalStatus#APPROVED}, or throws unless
     *         currently {@link EventProposalStatus#MODERATOR_REVIEW}
     */
    public EventProposal approve() {
        if (status != EventProposalStatus.MODERATOR_REVIEW) {
            throw new IllegalStateException("only a MODERATOR_REVIEW proposal can be approved, was " + status);
        }
        return new EventProposal(
                id, authorId, title, description, type, startAt, endAt, timezone, location, imageUrl,
                EventProposalStatus.APPROVED, submittedAt, aiPrecheck, moderatorNote);
    }
}
