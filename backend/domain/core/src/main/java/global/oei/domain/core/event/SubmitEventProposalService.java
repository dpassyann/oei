package global.oei.domain.core.event;

import java.time.Instant;
import java.util.UUID;

import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventProposal;
import global.oei.domain.shared.event.EventProposalPort;
import global.oei.domain.shared.event.EventProposalStatus;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.event.SubmitEventProposalUseCase;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Creates the proposal in {@link EventProposalStatus#DRAFT} then immediately
 * {@link EventProposal#submit(Instant)}s it (single-shot operation — see the operation's own
 * contract summary, no separate "save as draft" endpoint exists in this iteration).
 */
@Slf4j
@RequiredArgsConstructor
public class SubmitEventProposalService implements SubmitEventProposalUseCase {

    @NonNull
    private final EventProposalPort eventProposalPort;

    @Override
    public EventProposal execute(
            final MemberId authorId, final String title, final String description, final EventType type, final Instant startAt,
            final Instant endAt, final String timezone, final EventLocation location, final String imageUrl) {
        log.debug("submitEventProposal: authorId={} title={} type={}", authorId, title, type);
        final EventProposal draft = new EventProposal(
                UUID.randomUUID().toString(), authorId, title, description, type, startAt, endAt, timezone, location, imageUrl,
                EventProposalStatus.DRAFT, null, null, null);
        final EventProposal submitted = draft.submit(Instant.now());
        log.info("submitEventProposal: submitted proposalId={} authorId={}", submitted.id(), authorId);
        return eventProposalPort.save(submitted);
    }
}
