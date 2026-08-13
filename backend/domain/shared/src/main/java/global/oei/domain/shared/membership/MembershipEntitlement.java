package global.oei.domain.shared.membership;

/**
 * Rights gated by {@link MembershipStatus#entitlements()}, mirrored one-to-one on the OEI
 * OpenAPI contract ({@code MembershipEntitlement} schema) and on the frontend's
 * {@code MembershipEntitlement} union type — do not reorder/rename without updating both.
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
    CERTIFICATION_BADGE
}
