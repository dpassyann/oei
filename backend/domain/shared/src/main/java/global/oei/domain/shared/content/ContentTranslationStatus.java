package global.oei.domain.shared.content;

/**
 * Lifecycle of a {@link ContentTranslation}.
 */
public enum ContentTranslationStatus {
    PENDING,
    MACHINE_GENERATED,
    IN_REVIEW,
    VALIDATED,
    OUTDATED
}
