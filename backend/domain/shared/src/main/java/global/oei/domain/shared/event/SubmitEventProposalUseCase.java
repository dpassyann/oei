package global.oei.domain.shared.event;

import java.time.Instant;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: submit a new {@link EventProposal} straight to moderator review.
 */
public interface SubmitEventProposalUseCase {

    EventProposal execute(
            MemberId authorId, String title, String description, EventType type, Instant startAt, Instant endAt, String timezone,
            EventLocation location, String imageUrl);
}
