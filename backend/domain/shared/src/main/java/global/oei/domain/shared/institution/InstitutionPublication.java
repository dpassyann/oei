package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

public record InstitutionPublication(
        String id,
        InstitutionId institutionId,
        InstitutionPublicationType type,
        String title,
        String body,
        PublicationWorkflowStatus status,
        MemberId authorMemberId,
        Instant submittedAt,
        Instant publishedAt) {

    public InstitutionPublication {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(body, "body must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * @return a new instance with {@code type}/{@code title}/{@code body} replaced, or
     *         throws unless currently {@link PublicationWorkflowStatus#DRAFT} or
     *         {@link PublicationWorkflowStatus#CHANGES_REQUESTED} (per the operation's own
     *         contract summary)
     */
    public InstitutionPublication withContent(final InstitutionPublicationType type, final String title, final String body) {
        if (status != PublicationWorkflowStatus.DRAFT && status != PublicationWorkflowStatus.CHANGES_REQUESTED) {
            throw new IllegalStateException("publication content can only be edited while DRAFT or CHANGES_REQUESTED, was " + status);
        }
        return new InstitutionPublication(id, institutionId, type, title, body, status, authorMemberId, submittedAt, publishedAt);
    }

    /**
     * @return a new instance moved to {@link PublicationWorkflowStatus#SUBMITTED}, or throws
     *         unless currently {@link PublicationWorkflowStatus#DRAFT} or
     *         {@link PublicationWorkflowStatus#CHANGES_REQUESTED}
     */
    public InstitutionPublication submit(final Instant now) {
        if (status != PublicationWorkflowStatus.DRAFT && status != PublicationWorkflowStatus.CHANGES_REQUESTED) {
            throw new IllegalStateException("only a DRAFT/CHANGES_REQUESTED publication can be submitted, was " + status);
        }
        return new InstitutionPublication(
                id, institutionId, type, title, body, PublicationWorkflowStatus.SUBMITTED, authorMemberId, now, publishedAt);
    }
}
