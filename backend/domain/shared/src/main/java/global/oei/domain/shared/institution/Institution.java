package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Objects;

/**
 * An institutional partner (employer/member organization). Its administrative lifecycle
 * ({@link #status()}) is governed by OEI admins only ({@code /api/admin/v1/institutions/**});
 * the institution's own team can only edit its descriptive/contact fields via
 * {@code updateMyInstitutionAccount} — see {@link #withUpdatedProfile(Institution)}.
 */
public record Institution(
        InstitutionId id,
        String legalName,
        String publicName,
        String logoUrl,
        String country,
        List<String> sectors,
        String description,
        List<InstitutionDomain> emailDomains,
        String publicSlug,
        boolean isDemoData,
        InstitutionWorkflowStatus status) {

    public Institution {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(legalName, "legalName must not be null");
        Objects.requireNonNull(publicName, "publicName must not be null");
        Objects.requireNonNull(country, "country must not be null");
        Objects.requireNonNull(publicSlug, "publicSlug must not be null");
        Objects.requireNonNull(status, "status must not be null");
        sectors = List.copyOf(sectors == null ? List.of() : sectors);
        emailDomains = List.copyOf(emailDomains == null ? List.of() : emailDomains);
    }

    /**
     * @return a new instance with the descriptive/contact fields of {@code submitted}
     *         applied; {@link #id()}, {@link #publicSlug()}, {@link #isDemoData()} and
     *         {@link #status()} (server-controlled, governance-only) are always preserved
     *         from {@code this}, never overwritten by the caller-submitted body
     */
    public Institution withUpdatedProfile(final Institution submitted) {
        return new Institution(
                id,
                submitted.legalName(),
                submitted.publicName(),
                submitted.logoUrl(),
                submitted.country(),
                submitted.sectors(),
                submitted.description(),
                submitted.emailDomains(),
                publicSlug,
                isDemoData,
                status);
    }

    /**
     * @return a new instance with {@link #status()} replaced; every other field unchanged
     */
    public Institution withStatus(final InstitutionWorkflowStatus newStatus) {
        return new Institution(
                id, legalName, publicName, logoUrl, country, sectors, description, emailDomains, publicSlug,
                isDemoData, newStatus);
    }

    /**
     * @return a new instance moved to {@link InstitutionWorkflowStatus#APPROVED}, or throws if
     *         already {@link InstitutionWorkflowStatus#ACTIVE}, {@link InstitutionWorkflowStatus#SUSPENDED},
     *         {@link InstitutionWorkflowStatus#REVOKED} or {@link InstitutionWorkflowStatus#ARCHIVED}
     */
    public Institution approve() {
        requireNotIn(InstitutionWorkflowStatus.ACTIVE, InstitutionWorkflowStatus.SUSPENDED, InstitutionWorkflowStatus.REVOKED,
                InstitutionWorkflowStatus.ARCHIVED);
        return withStatus(InstitutionWorkflowStatus.APPROVED);
    }

    /**
     * @return a new instance moved to {@link InstitutionWorkflowStatus#ACTIVE}; requires
     *         {@link InstitutionWorkflowStatus#APPROVED}. See the {@code activateInstitution}
     *         operation's own contract summary: this only represents the state transition —
     *         no real Keycloak provisioning call exists yet in this iteration.
     */
    public Institution activate() {
        require(InstitutionWorkflowStatus.APPROVED);
        return withStatus(InstitutionWorkflowStatus.ACTIVE);
    }

    /**
     * @return a new instance moved to {@link InstitutionWorkflowStatus#SUSPENDED}; requires
     *         {@link InstitutionWorkflowStatus#ACTIVE} (soft delete, never physical removal)
     */
    public Institution suspend() {
        require(InstitutionWorkflowStatus.ACTIVE);
        return withStatus(InstitutionWorkflowStatus.SUSPENDED);
    }

    /**
     * @return a new instance moved to {@link InstitutionWorkflowStatus#REVOKED}, or throws if
     *         already {@link InstitutionWorkflowStatus#REVOKED} (soft delete, never physical removal)
     */
    public Institution revoke() {
        requireNotIn(InstitutionWorkflowStatus.REVOKED);
        return withStatus(InstitutionWorkflowStatus.REVOKED);
    }

    private void require(final InstitutionWorkflowStatus expected) {
        if (status != expected) {
            throw new IllegalStateException("expected status " + expected + " but was " + status);
        }
    }

    private void requireNotIn(final InstitutionWorkflowStatus... forbidden) {
        for (final InstitutionWorkflowStatus candidate : forbidden) {
            if (status == candidate) {
                throw new IllegalStateException("status must not be " + candidate);
            }
        }
    }
}
