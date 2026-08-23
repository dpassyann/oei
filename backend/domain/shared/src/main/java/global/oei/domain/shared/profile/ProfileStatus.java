package global.oei.domain.shared.profile;

/**
 * Lifecycle status of a member's {@link ProfessionalProfile}, returned by the bootstrap
 * endpoint ({@code GET /api/member/v1/bootstrap}).
 *
 * <p>A missing profile is NOT a server error — it is a domain state ({@code ONBOARDING_REQUIRED})
 * that the frontend uses to trigger the Smart Profile Onboarding modal. Never map this to
 * HTTP 500; use 200 with the appropriate status value, or 404 for individual profile
 * resources that genuinely don't exist yet.</p>
 */
public enum ProfileStatus {
    /**
     * No profile exists yet for this member. The onboarding modal must be shown.
     */
    ONBOARDING_REQUIRED,

    /**
     * An onboarding session is in progress (document uploaded, AI processing, or review
     * pending) but the profile has not been confirmed yet.
     */
    ONBOARDING_IN_PROGRESS,

    /**
     * A profile exists but important required sections are missing.
     */
    PROFILE_INCOMPLETE,

    /**
     * A profile exists and is sufficiently complete for normal member-space use.
     */
    READY,

    /**
     * The member's account or profile has been administratively suspended.
     */
    SUSPENDED
}

