package global.oei.domain.shared.profile;

/**
 * Indicates how the initial {@link ProfessionalProfile} content was obtained.
 *
 * <p>A profile may have no source ({@code null}) when it was created manually, field by
 * field, via the classic onboarding wizard. The preferred V2 flow is import-first:
 * {@link #CV_IMPORTED} (via the Smart CV Import pipeline) or {@link #LINKEDIN_BASIC}.</p>
 *
 * <p>This value is informational; it does not by itself grant or restrict any entitlement —
 * the {@link global.oei.domain.shared.membership.MembershipEntitlement} model handles that
 * separately.</p>
 */
public enum ProfileSource {
    /**
     * Profile content was entered manually by the member through the wizard (legacy path,
     * no AI or external service involved).
     */
    MANUAL,

    /**
     * Profile was bootstrapped from LinkedIn identity data only (basic OAuth — name, photo,
     * email, locale). Professional history is NOT included until the extended LinkedIn
     * product is available.
     */
    LINKEDIN_BASIC,

    /**
     * Profile was created from an AI-assisted CV document import
     * ({@link global.oei.domain.shared.membership.MembershipEntitlement#AI_CV_IMPORT}).
     */
    CV_IMPORTED,

    /**
     * Profile was bootstrapped from LinkedIn basic identity then enriched by a CV import.
     */
    LINKEDIN_AND_CV
}

