package global.oei.domain.shared.cv;

/**
 * Kind of a {@link CvSection}, mirrored one-to-one on the OEI OpenAPI contract
 * ({@code CvSectionType} enum).
 */
public enum CvSectionType {
    IDENTITY,
    SUMMARY,
    EXPERIENCE,
    PROJECT,
    EDUCATION,
    CERTIFICATION,
    SKILL,
    LANGUAGE,
    PUBLICATION,
    CONFERENCE,
    ENGAGEMENT,
    DISTINCTION,
    REFERENCE
}
