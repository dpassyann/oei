package global.oei.domain.shared.cv;

/**
 * Lifecycle of a {@link Cv}, mirrored one-to-one on the OEI OpenAPI contract
 * ({@code Cv.status} enum).
 */
public enum CvStatus {
    DRAFT,
    READY
}
