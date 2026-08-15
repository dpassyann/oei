package global.oei.domain.core.content;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.content.CreateContentContributionUseCase;
import global.oei.domain.shared.member.MemberId;

/**
 * Enforces the submission invariant on {@link ContentContribution}: every contribution this
 * service creates starts {@link ContentContributionStatus#PROPOSED} — never a direct edit of
 * published text, always a proposal that goes through consultation.
 */
public class CreateContentContributionService implements CreateContentContributionUseCase {

    private final ContentContributionPort contentContributionPort;

    public CreateContentContributionService(final ContentContributionPort contentContributionPort) {
        this.contentContributionPort = Objects.requireNonNull(contentContributionPort, "contentContributionPort must not be null");
    }

    @Override
    public ContentContribution execute(final MemberId authorMemberId, final String contentId, final String patch) {
        final ContentContribution contribution = new ContentContribution(
                UUID.randomUUID().toString(), contentId, patch, authorMemberId, ContentContributionStatus.PROPOSED, Instant.now());
        return contentContributionPort.save(contribution);
    }
}
