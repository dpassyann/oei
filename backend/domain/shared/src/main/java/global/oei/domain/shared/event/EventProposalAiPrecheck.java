package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.Objects;

/**
 * Result of the (always non-blocking) automated precheck folded into {@link EventProposal#submit}.
 */
public record EventProposalAiPrecheck(boolean passed, String summary, Instant checkedAt) {

    public EventProposalAiPrecheck {
        Objects.requireNonNull(summary, "summary must not be null");
        Objects.requireNonNull(checkedAt, "checkedAt must not be null");
    }
}
