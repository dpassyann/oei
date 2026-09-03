package global.oei.domain.shared.profile;

import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.network.CompensationDeclarationCandidate;
import global.oei.domain.shared.network.CompensationPeriod;
import global.oei.domain.shared.network.NetworkSalaryNodeType;

/**
 * A member's professional profile — deliberately a "big object" replaced wholesale by
 * {@code PUT /api/member/v1/profile} rather than exposing per-field CRUD, per ADR 0002
 * ("simplicité du contrat prime sur la granularité").
 *
 * <p>{@link #currentCompensation()} is always private: never part of any public-facing
 * schema/endpoint. See its own Javadoc for how it currently relates (or, more precisely,
 * does not yet automatically relate) to the anonymized {@code SalaryInsight} aggregates.</p>
 *
 * <p>{@link #source()} records how the profile content was initially obtained (manual,
 * LinkedIn, CV import …). A {@code null} source means the member never went through a
 * structured onboarding path — typically a legacy account that predates the import-first
 * onboarding feature. It is NOT a required field: the profile is valid with or without a
 * source value.</p>
 *
 * <p>Note: a {@code ProfessionalProfile} does NOT require a CV. The CV document (see
 * {@link global.oei.domain.shared.cv.Cv}) is an independent, optional construct. A
 * profile may exist without any CV document, including when it was created via
 * LinkedIn or manually.</p>
 */
public record ProfessionalProfile(
        MemberId memberId,
        ProfileSource source,
        String title,
        String summary,
        String location,
        Availability availability,
        List<String> expertiseAreas,
        List<String> technologies,
        List<String> sectors,
        List<LanguageProficiency> languages,
        List<Experience> experiences,
        List<Education> educations,
        List<Skill> skills,
        CurrentCompensation currentCompensation,
        int completenessScore) {

    public ProfessionalProfile {
        Objects.requireNonNull(memberId, "memberId must not be null");
        expertiseAreas = List.copyOf(expertiseAreas == null ? List.of() : expertiseAreas);
        technologies = List.copyOf(technologies == null ? List.of() : technologies);
        sectors = List.copyOf(sectors == null ? List.of() : sectors);
        languages = List.copyOf(languages == null ? List.of() : languages);
        experiences = List.copyOf(experiences == null ? List.of() : experiences);
        educations = List.copyOf(educations == null ? List.of() : educations);
        skills = List.copyOf(skills == null ? List.of() : skills);
        if (completenessScore < 0 || completenessScore > 100) {
            throw new IllegalArgumentException("completenessScore must be between 0 and 100");
        }
    }

    /**
     * @return a new instance with {@link #memberId()} replaced; every other field is
     *         unchanged. Used at the HTTP boundary to overwrite whatever {@code memberId} a
     *         PUT request body carried with the authenticated caller's own identity — a
     *         member can only ever update their own profile.
     */
    public ProfessionalProfile withMemberId(final MemberId memberId) {
        return new ProfessionalProfile(
                memberId,
                source,
                title,
                summary,
                location,
                availability,
                expertiseAreas,
                technologies,
                sectors,
                languages,
                experiences,
                educations,
                skills,
                currentCompensation,
                completenessScore);
    }

    /**
     * @return a new instance with {@link #source()} replaced; every other field is unchanged.
     */
    public ProfessionalProfile withSource(final ProfileSource source) {
        return new ProfessionalProfile(
                memberId,
                source,
                title,
                summary,
                location,
                availability,
                expertiseAreas,
                technologies,
                sectors,
                languages,
                experiences,
                educations,
                skills,
                currentCompensation,
                completenessScore);
    }

    /**
     * Recomputes {@link #completenessScore()} from the fields this profile currently holds,
     * mirroring the frontend's completeness rubric (title/summary/location/availability,
     * >=1 language, >=1 experience, >=1 education, >=3 skills, non-empty expertise areas —
     * each worth an equal share of 100, rounded down).
     *
     * @return a new instance with {@link #completenessScore()} replaced; every other field
     *         is unchanged
     */
    public ProfessionalProfile withRecomputedCompleteness() {
        final int criteriaCount = 6;
        int satisfied = 0;
        if (isNotBlank(title) && isNotBlank(summary) && isNotBlank(location) && availability != null) {
            satisfied++;
        }
        if (!expertiseAreas.isEmpty()) {
            satisfied++;
        }
        if (!languages.isEmpty()) {
            satisfied++;
        }
        if (!experiences.isEmpty()) {
            satisfied++;
        }
        if (!educations.isEmpty()) {
            satisfied++;
        }
        if (skills.size() >= 3) {
            satisfied++;
        }
        final int score = satisfied * 100 / criteriaCount;
        return new ProfessionalProfile(
                memberId,
                source,
                title,
                summary,
                location,
                availability,
                expertiseAreas,
                technologies,
                sectors,
                languages,
                experiences,
                educations,
                skills,
                currentCompensation,
                score);
    }

    private static boolean isNotBlank(final String value) {
        return value != null && !value.isBlank();
    }

    /**
     * Derives the full set of anonymized-pool candidate rows this profile currently feeds,
     * from every {@link Experience} that carries a {@code grossAnnualSalary} (the trigger — see
     * that field's own Javadoc), fanned out across this profile's {@link #expertiseAreas()} as
     * {@link NetworkSalaryNodeType#DOMAIN} graph nodes.
     *
     * <p><strong>Open modeling question</strong> (see MEMBER-SPACE-CURRENT-STATE.md §6): a
     * member's freeform {@code expertiseAreas} entries are not validated against the canonical
     * {@code NetworkDomain} catalog (fixed slugs such as {@code "ia"}/{@code "cloud"}); a
     * declaration whose {@code nodeId} does not match a real domain slug is stored but never
     * surfaces in any {@code SalaryInsight} aggregate. A dedicated expertise-area-to-domain
     * mapping (or a domain picker constrained to the catalog) would close this gap; out of
     * scope here since {@code Experience} itself carries no domain/topic linkage today.</p>
     *
     * @param country free-text country label (same format as {@code CurrentCompensation.country}
     *                 / {@code NetworkExpert.country}), or {@code null} to leave every derived
     *                 declaration country-agnostic
     * @return one candidate per (salaried experience × expertise area) pair; empty when no
     *         experience carries a salary or the profile lists no expertise area to attach to
     */
    public List<CompensationDeclarationCandidate> deriveCompensationDeclarations(final String country) {
        if (expertiseAreas.isEmpty()) {
            return List.of();
        }
        return experiences.stream()
                .filter(Experience::hasGrossAnnualSalary)
                .flatMap(experience -> expertiseAreas.stream()
                        .map(domainId -> new CompensationDeclarationCandidate(
                                NetworkSalaryNodeType.DOMAIN,
                                domainId,
                                country,
                                experience.grossAnnualSalary(),
                                experience.salaryCurrency(),
                                CompensationPeriod.YEAR)))
                .toList();
    }
}
