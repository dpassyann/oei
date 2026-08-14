package global.oei.domain.shared.event;

/**
 * Lifecycle of an {@link Event}.
 */
public enum EventStatus {
    DRAFT,
    PUBLISHED,
    REGISTRATION_OPEN,
    REGISTRATION_CLOSED,
    LIVE,
    ENDED,
    ARCHIVED,
    CANCELLED
}
