package global.oei.domain.shared.event;

/**
 * Mirrors the OEI OpenAPI contract's {@code EventType} enum, whose wire values are
 * lowercase ({@code meetup}, {@code colloque}, ...) — mapped at the DTO boundary via
 * {@code name().toLowerCase()}/{@code valueOf(value.toUpperCase())}.
 */
public enum EventType {
    MEETUP,
    COLLOQUE,
    CONFERENCE,
    WEBINAR,
    WORKSHOP,
    ASSEMBLEE,
    CEREMONIE,
    NETWORKING
}
