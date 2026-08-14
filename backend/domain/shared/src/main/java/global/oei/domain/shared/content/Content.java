package global.oei.domain.shared.content;

import java.util.List;
import java.util.Objects;

/**
 * A CMS/governance content item (page, article, normative document, ...). {@link #status()}
 * always mirrors the workflow status of its {@link #currentVersionId()} version (kept in
 * lockstep by the application-web {@code ContentService} whenever a transition method below
 * is applied) — see {@link ContentWorkflowStatus}'s Javadoc for the full state machine.
 *
 * <p>Each {@code updateAdminContent} call creates a brand-new {@link ContentVersion} (never
 * overwrites a published one — see the operation's own contract summary) and resets this
 * aggregate back to {@link ContentWorkflowStatus#DRAFT} via {@link #withNewVersion(String)}.</p>
 */
public record Content(
        String id,
        ContentType type,
        String slug,
        ContentSourceType sourceType,
        String title,
        List<String> tags,
        ContentGovernance governance,
        String currentVersionId,
        ContentWorkflowStatus status) {

    public Content {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(slug, "slug must not be null");
        Objects.requireNonNull(sourceType, "sourceType must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(status, "status must not be null");
        tags = List.copyOf(tags == null ? List.of() : tags);
    }

    public Content withNewVersion(final String versionId) {
        return new Content(id, type, slug, sourceType, title, tags, governance, versionId, ContentWorkflowStatus.DRAFT);
    }

    /**
     * @return a new instance moved to {@link ContentWorkflowStatus#IN_REVIEW}; requires
     *         {@link ContentWorkflowStatus#DRAFT}
     */
    public Content submit() {
        require(ContentWorkflowStatus.DRAFT);
        return withStatus(ContentWorkflowStatus.IN_REVIEW);
    }

    /**
     * @return a new instance reflecting {@code decision}: on {@link ContentApprovalDecision#APPROVED}
     *         advances one review step ({@code IN_REVIEW -> LEGAL_REVIEW -> GOVERNANCE_REVIEW ->
     *         APPROVED}); otherwise moves back to {@link ContentWorkflowStatus#DRAFT}. Requires
     *         the current status to be one of the three review steps.
     */
    public Content recordApproval(final ContentApprovalDecision decision) {
        if (status != ContentWorkflowStatus.IN_REVIEW && status != ContentWorkflowStatus.LEGAL_REVIEW
                && status != ContentWorkflowStatus.GOVERNANCE_REVIEW) {
            throw new IllegalStateException("approve is only valid during a review step, was " + status);
        }
        if (decision != ContentApprovalDecision.APPROVED) {
            return withStatus(ContentWorkflowStatus.DRAFT);
        }
        final ContentWorkflowStatus next = switch (status) {
            case IN_REVIEW -> ContentWorkflowStatus.LEGAL_REVIEW;
            case LEGAL_REVIEW -> ContentWorkflowStatus.GOVERNANCE_REVIEW;
            case GOVERNANCE_REVIEW -> ContentWorkflowStatus.APPROVED;
            default -> throw new IllegalStateException("unreachable");
        };
        return withStatus(next);
    }

    /**
     * @return a new instance moved back to {@link ContentWorkflowStatus#DRAFT} (dedicated
     *         reject operation, distinct from {@link #recordApproval(ContentApprovalDecision)})
     */
    public Content reject() {
        return withStatus(ContentWorkflowStatus.DRAFT);
    }

    /**
     * @return a new instance moved to {@link ContentWorkflowStatus#TRANSLATION_PENDING};
     *         requires {@link ContentWorkflowStatus#APPROVED}
     */
    public Content requestTranslation() {
        require(ContentWorkflowStatus.APPROVED);
        return withStatus(ContentWorkflowStatus.TRANSLATION_PENDING);
    }

    /**
     * @return a new instance moved to {@link ContentWorkflowStatus#SCHEDULED}; requires
     *         {@link ContentWorkflowStatus#APPROVED} or {@link ContentWorkflowStatus#TRANSLATION_PENDING}
     */
    public Content schedule() {
        requireOneOf(ContentWorkflowStatus.APPROVED, ContentWorkflowStatus.TRANSLATION_PENDING);
        return withStatus(ContentWorkflowStatus.SCHEDULED);
    }

    /**
     * @return a new instance moved to {@link ContentWorkflowStatus#PUBLISHED}; requires
     *         {@link ContentWorkflowStatus#APPROVED}, {@link ContentWorkflowStatus#TRANSLATION_PENDING}
     *         or {@link ContentWorkflowStatus#SCHEDULED}
     */
    public Content publish() {
        requireOneOf(ContentWorkflowStatus.APPROVED, ContentWorkflowStatus.TRANSLATION_PENDING, ContentWorkflowStatus.SCHEDULED);
        return withStatus(ContentWorkflowStatus.PUBLISHED);
    }

    /**
     * @return a new instance moved to {@link ContentWorkflowStatus#ARCHIVED} (never a physical
     *         delete); requires {@link ContentWorkflowStatus#PUBLISHED}
     */
    public Content archive() {
        require(ContentWorkflowStatus.PUBLISHED);
        return withStatus(ContentWorkflowStatus.ARCHIVED);
    }

    private Content withStatus(final ContentWorkflowStatus newStatus) {
        return new Content(id, type, slug, sourceType, title, tags, governance, currentVersionId, newStatus);
    }

    private void require(final ContentWorkflowStatus expected) {
        if (status != expected) {
            throw new IllegalStateException("expected status " + expected + " but was " + status);
        }
    }

    private void requireOneOf(final ContentWorkflowStatus... allowed) {
        for (final ContentWorkflowStatus candidate : allowed) {
            if (status == candidate) {
                return;
            }
        }
        throw new IllegalStateException("status " + status + " not in allowed set");
    }
}
