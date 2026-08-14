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
}
