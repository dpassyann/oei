package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

/**
 * An opportunity (job/internship/mentoring/pro-bono/working-group/call-for-experts) published
 * by an institution. Published immediately on creation in this iteration — the contract
 * defines no separate draft-submission workflow for opportunities, only {@link #close}.
 */
public record InstitutionOpportunity(
        String id,
        InstitutionId institutionId,
        InstitutionOpportunityType type,
        String title,
        String description,
        Instant expiresAt,
        InstitutionOpportunityStatus status,
        Instant publishedAt) {

    public InstitutionOpportunity {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    public InstitutionOpportunity withContent(
            final InstitutionOpportunityType type, final String title, final String description, final Instant expiresAt) {
        return new InstitutionOpportunity(id, institutionId, type, title, description, expiresAt, status, publishedAt);
    }

    /**
     * @return a new instance moved to {@link InstitutionOpportunityStatus#CLOSED}
     */
    public InstitutionOpportunity close() {
        return new InstitutionOpportunity(id, institutionId, type, title, description, expiresAt, InstitutionOpportunityStatus.CLOSED, publishedAt);
    }
}
