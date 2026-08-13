package global.oei.domain.shared.profile;

import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's professional profile — deliberately a "big object" replaced wholesale by
 * {@code PUT /api/member/v1/profile} rather than exposing per-field CRUD, per ADR 0002
 * ("simplicité du contrat prime sur la granularité").
 *
 * <p>{@link #currentCompensation()} is always private: never part of any public-facing
 * schema/endpoint. See its own Javadoc for how it currently relates (or, more precisely,
 * does not yet automatically relate) to the anonymized {@code SalaryInsight} aggregates.</p>
 */
public record ProfessionalProfile(
        MemberId memberId,
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
}
