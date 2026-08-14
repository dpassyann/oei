package global.oei.domain.shared.institution;

import java.util.Objects;

/**
 * Institution KPIs. {@link #contributions()} and {@link #trainings()} are always {@code 0} in
 * this iteration: there is no {@code InstitutionContribution}/training-participation table
 * backing them yet (per ADR 0002, {@code InstitutionContribution} is a documentary schema
 * without a dedicated endpoint in V1) — every other counter is a real, DB-backed count.
 */
public record InstitutionDashboard(
        InstitutionId institutionId,
        int affiliatedMembers,
        int activeMembers,
        int verifiedProfiles,
        int certifications,
        int badges,
        int signedCharters,
        int contributions,
        int trainings,
        int opportunities,
        int publications,
        int invitations) {

    public InstitutionDashboard {
        Objects.requireNonNull(institutionId, "institutionId must not be null");
    }
}
