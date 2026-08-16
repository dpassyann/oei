package global.oei.domain.shared.certification;

/**
 * The 6-level OEI expertise scale. A {@link RecognizedCertification} never automatically
 * confers the matching level — that judgment stays a separate governance decision (mirrors
 * the {@code CertificationLevel} OpenAPI schema's own doc comment).
 */
public enum CertificationLevel {
    PRACTITIONER,
    ENGINEER,
    ARCHITECT,
    EXPERT,
    SENIOR_EXPERT,
    FELLOW
}
