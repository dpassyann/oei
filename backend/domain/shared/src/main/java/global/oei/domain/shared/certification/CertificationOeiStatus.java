package global.oei.domain.shared.certification;

/**
 * OEI's own recognition posture on a {@link RecognizedCertification} (mirrors the
 * {@code CertificationOeiStatus} OpenAPI schema).
 */
public enum CertificationOeiStatus {
    OEI_RECOGNIZED,
    PARTNER_RECOGNIZED,
    UNDER_REVIEW,
    NOT_RECOGNIZED
}
