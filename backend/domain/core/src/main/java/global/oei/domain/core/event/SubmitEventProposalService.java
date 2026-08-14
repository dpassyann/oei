package global.oei.domain.core.event;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventProposal;
import global.oei.domain.shared.event.EventProposalPort;
import global.oei.domain.shared.event.EventProposalStatus;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.event.SubmitEventProposalUseCase;
import global.oei.domain.shared.member.MemberId;

/**
 * Creates the proposal in {@link EventProposalStatus#DRAFT} then immediately
 * {@link EventProposal#submit(Instant)}s it (single-shot operation — see the operation's own
 * contract summary, no separate "save as draft" endpoint exists in this iteration).
 */
public class SubmitEventProposalService implements SubmitEventProposalUseCase {

    private final EventProposalPort eventProposalPort;

    public SubmitEventProposalService(final EventProposalPort eventProposalPort) {
        this.eventProposalPort = Objects.requireNonNull(eventProposalPort, "eventProposalPort must not be null");
    }

    @Override
    public EventProposal execute(
            final MemberId authorId, final String title, final String description, final EventType type, final Instant startAt,
            final Instant endAt, final String timezone, final EventLocation location, final String imageUrl) {
        final EventProposal draft = new EventProposal(
                UUID.randomUUID().toString(), authorId, title, description, type, startAt, endAt, timezone, location, imageUrl,
                EventProposalStatus.DRAFT, null, null, null);
        return eventProposalPort.save(draft.submit(Instant.now()));
    }
}
