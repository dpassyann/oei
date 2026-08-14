package global.oei.domain.shared.event;

import java.time.Instant;

import global.oei.domain.shared.member.MemberId;

public interface SubmitEventProposalUseCase {

    EventProposal execute(
            MemberId authorId, String title, String description, EventType type, Instant startAt, Instant endAt, String timezone,
            EventLocation location, String imageUrl);
}
