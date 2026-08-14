package global.oei.domain.shared.event;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link EventProposal}.
 */
public interface EventProposalPort {

    EventProposal save(EventProposal proposal);

    Optional<EventProposal> findById(String id);

    List<EventProposal> findByAuthorId(MemberId authorId);

    List<EventProposal> findByStatus(EventProposalStatus status);
}
