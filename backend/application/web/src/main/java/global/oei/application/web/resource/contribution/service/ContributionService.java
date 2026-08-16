package global.oei.application.web.resource.contribution.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.contribution.adapter.ContributionAdapter;
import global.oei.domain.shared.content.ContentComment;
import global.oei.domain.shared.content.ContentCommentPort;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.CreateContentContributionUseCase;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContributionService implements ContributionAdapter {

    private final SecurityContextPort securityContextPort;
    private final ContentContributionPort contentContributionPort;
    private final CreateContentContributionUseCase createContentContributionUseCase;
    private final ContentCommentPort contentCommentPort;

    @Override
    public List<ContentContribution> listMyContributions() {
        return contentContributionPort.findByAuthorMemberId(currentMemberId());
    }

    @Override
    public ContentContribution create(final String contentId, final String patch) {
        return createContentContributionUseCase.execute(currentMemberId(), contentId, patch);
    }

    @Override
    public Optional<List<ContentComment>> listComments(final String contributionId) {
        return contentContributionPort.findById(contributionId).map(contribution -> contentCommentPort.findByContributionId(contributionId));
    }

    @Override
    public Optional<ContentComment> addComment(final String contributionId, final String body) {
        return contentContributionPort.findById(contributionId)
                .map(contribution -> contentCommentPort.save(new ContentComment(
                        UUID.randomUUID().toString(), contributionId, null, currentMemberId().toString(), body, Instant.now())));
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
