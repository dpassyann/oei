package global.oei.domain.shared.cv;

/**
 * Lifecycle of a {@link CvTranslation}: never usable in a {@code renderCv} until it reaches
 * {@link #VALIDATED} by a human (see {@code Cv#validateSectionTranslation}).
 */
public enum CvTranslationStatus {
    MACHINE_GENERATED,
    PENDING_VALIDATION,
    VALIDATED
}
