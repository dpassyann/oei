package global.oei.domain.shared.membership;

/**
 * Rights gated by {@link MembershipStatus#entitlements()}, mirrored one-to-one on the OEI
 * OpenAPI contract ({@code MembershipEntitlement} schema) and on the frontend's
 * {@code MembershipEntitlement} union type — do not reorder/rename without updating both.
 *
 * <p>AI-related entitlements ({@code AI_CV_IMPORT}, {@code AI_CV_REIMPORT},
 * {@code AI_PROFILE_TRANSLATION}) gate the paid Smart CV Import pipeline (see ADR for the
 * import-first onboarding spec). They are included in every active membership status; for
 * non-members they are grantable via one-time purchase (see {@code EntitlementSource}).</p>
 */
public enum MembershipEntitlement {
    PROFILE_EDIT,
    PROFILE_PUBLIC,
    CV_EDIT,
    CV_EXPORT_PDF,
    BUSINESS_CARD_EXPORT,
    BUSINESS_CARD_ORDER,
    ARTICLE_SUBMIT,
    EVENT_POST,
    MEMBER_DIRECTORY,
    WALLET_PASS,
    CERTIFICATION_BADGE,
    /** AI-assisted initial import of a CV document into a structured ProfessionalProfile. */
    AI_CV_IMPORT,
    /** AI-assisted re-import (replace) of the CV document — separate from initial import. */
    AI_CV_REIMPORT,
    /** AI-assisted translation of the professional profile into another language. */
    AI_PROFILE_TRANSLATION
}
