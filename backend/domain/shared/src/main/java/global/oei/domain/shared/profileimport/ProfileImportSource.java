package global.oei.domain.shared.profileimport;

/**
 * Document format or external service a {@link ProfileImport} session was initiated from,
 * mirrored one-to-one on the OEI OpenAPI contract ({@code ProfileImportSource} enum).
 *
 * <p>Deliberately distinct from {@link global.oei.domain.shared.profile.ProfileSource}: that
 * enum records how a {@code ProfessionalProfile} was ultimately populated (a durable fact
 * about the profile itself); this one records what kind of input a single import
 * <em>session</em> was fed (a transient fact about the pipeline run).</p>
 */
public enum ProfileImportSource {
    CV_PDF,
    CV_DOCX,
    LINKEDIN_BASIC
}
