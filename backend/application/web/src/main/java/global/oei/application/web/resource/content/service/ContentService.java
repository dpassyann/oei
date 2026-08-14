package global.oei.application.web.resource.content.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.content.adapter.ContentAdapter;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentApproval;
import global.oei.domain.shared.content.ContentApprovalDecision;
import global.oei.domain.shared.content.ContentApprovalPort;
import global.oei.domain.shared.content.ContentApprovalRole;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentGovernance;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentPublication;
import global.oei.domain.shared.content.ContentPublicationPort;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentTranslation;
import global.oei.domain.shared.content.ContentTranslationPort;
import global.oei.domain.shared.content.ContentTranslationStatus;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.content.CreateContentUseCase;
import global.oei.domain.shared.content.CreateContentVersionUseCase;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContentService implements ContentAdapter {

    private final SecurityContextPort securityContextPort;
    private final ContentPort contentPort;
    private final CreateContentUseCase createContentUseCase;
    private final ContentVersionPort contentVersionPort;
    private final CreateContentVersionUseCase createContentVersionUseCase;
    private final ContentApprovalPort contentApprovalPort;
    private final ContentTranslationPort contentTranslationPort;
    private final ContentContributionPort contentContributionPort;
    private final ContentPublicationPort contentPublicationPort;

    @Override
    public List<Content> listContent(
            final ContentType type, final ContentWorkflowStatus status, final String lang, final String tag, final String q) {
        return contentPort.search(type, status, lang, tag, q);
    }

    @Override
    public Content createContent(
            final ContentType type, final String slug, final ContentSourceType sourceType, final String title, final List<String> tags,
            final ContentGovernance governance) {
        return createContentUseCase.execute(type, slug, sourceType, title, tags, governance);
    }

    @Override
    public Optional<Content> getContent(final String id) {
        return contentPort.findById(id);
    }

    @Override
    public Optional<ContentVersion> updateContent(
            final String id, final String language, final String title, final String body, final Map<String, Object> frontMatter) {
        if (contentPort.findById(id).isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(createContentVersionUseCase.execute(id, language, title, body, frontMatter, currentActorId()));
    }

    @Override
    public List<ContentVersion> listVersions(final String id) {
        return contentVersionPort.findByContentId(id);
    }

    @Override
    public Optional<Content> submitContent(final String id) {
        return applyTransition(id, Content::submit);
    }

    @Override
    public Optional<ContentApproval> approveContent(
            final String id, final ContentApprovalRole role, final ContentApprovalDecision decision, final String comment) {
        return contentPort.findById(id).map(content -> {
            if (content.currentVersionId() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "content has no current version");
            }
            final ContentApproval approval = contentApprovalPort.save(new ContentApproval(
                    UUID.randomUUID().toString(), content.currentVersionId(), role, decision, comment, currentActorId(), Instant.now()));
            final Content updated = contentPort.save(content.recordApproval(decision));
            mirrorVersionStatus(updated);
            return approval;
        });
    }

    @Override
    public Optional<Content> rejectContent(final String id, final String comment) {
        return contentPort.findById(id).map(content -> {
            if (content.currentVersionId() != null) {
                contentApprovalPort.save(new ContentApproval(
                        UUID.randomUUID().toString(), content.currentVersionId(), ContentApprovalRole.GOVERNANCE,
                        ContentApprovalDecision.REJECTED, comment, currentActorId(), Instant.now()));
            }
            final Content rejected = contentPort.save(content.reject());
            mirrorVersionStatus(rejected);
            return rejected;
        });
    }

    @Override
    public Optional<Content> requestTranslation(final String id) {
        return applyTransition(id, Content::requestTranslation);
    }

    @Override
    public Optional<Content> scheduleContent(final String id) {
        return applyTransition(id, Content::schedule);
    }

    @Override
    public Optional<ContentPublication> publishContent(final String id) {
        return contentPort.findById(id).map(content -> {
            final Content published = contentPort.save(content.publish());
            mirrorVersionStatus(published);
            return contentPublicationPort.save(new ContentPublication(
                    UUID.randomUUID().toString(), published.currentVersionId(), Instant.now(), currentActorId(), null));
        });
    }

    @Override
    public Optional<Content> archiveContent(final String id) {
        return applyTransition(id, Content::archive);
    }

    @Override
    public Optional<ContentTranslation> createTranslation(
            final String id, final String language, final ContentTranslationStatus status, final String translatorId) {
        return contentPort.findById(id).map(content -> contentTranslationPort.save(new ContentTranslation(
                UUID.randomUUID().toString(), content.currentVersionId(), language, status, translatorId, null, null)));
    }

    @Override
    public Optional<ContentTranslation> validateTranslation(final String id, final String language) {
        return contentPort.findById(id)
                .filter(content -> content.currentVersionId() != null)
                .flatMap(content -> contentTranslationPort.findByContentVersionIdAndLanguage(content.currentVersionId(), language))
                .map(translation -> contentTranslationPort.save(translation.validate(currentActorId(), Instant.now())));
    }

    @Override
    public List<ContentContribution> listContributions(final String id) {
        return contentContributionPort.findByContentId(id);
    }

    private Optional<Content> applyTransition(final String id, final java.util.function.UnaryOperator<Content> transition) {
        return contentPort.findById(id).map(content -> {
            final Content updated = contentPort.save(transition.apply(content));
            mirrorVersionStatus(updated);
            return updated;
        });
    }

    /** Keeps the current {@link ContentVersion}'s own status in lockstep with {@link Content#status()}. */
    private Optional<Content> mirrorVersionStatus(final Content content) {
        if (content.currentVersionId() != null) {
            contentVersionPort.findById(content.currentVersionId())
                    .ifPresent(version -> contentVersionPort.save(version.withStatus(content.status())));
        }
        return Optional.of(content);
    }

    private String currentActorId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return identity.subject();
    }
}
