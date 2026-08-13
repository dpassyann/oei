package global.oei.domain.shared.profile;

/**
 * Professional availability signal on a {@link ProfessionalProfile}, mirrored one-to-one on
 * the OEI OpenAPI contract ({@code ProfessionalProfile.availability} enum).
 */
public enum Availability {
    AVAILABLE,
    OPEN_TO_OPPORTUNITIES,
    NOT_AVAILABLE
}
