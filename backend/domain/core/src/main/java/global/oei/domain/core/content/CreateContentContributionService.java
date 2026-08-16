package global.oei.domain.core.content;

import java.time.Instant;
import java.util.UUID;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.content.CreateContentContributionUseCase;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Enforces the submission invariant on {@link ContentContribution}: every contribution this
 * service creates starts {@link ContentContributionStatus#PROPOSED} — never a direct edit of
 * published text, always a proposal that goes through consultation.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateContentContributionService implements CreateContentContributionUseCase {

    @NonNull
    private final ContentContributionPort contentContributionPort;

    @Override
    public ContentContribution execute(final MemberId authorMemberId, final String contentId, final String patch) {
        log.debug("CreateContentContributionService: execute called");
        final ContentContribution contribution = new ContentContribution(
                UUID.randomUUID().toString(), contentId, patch, authorMemberId, ContentContributionStatus.PROPOSED, Instant.now());
        return contentContributionPort.save(contribution);
    }
}
