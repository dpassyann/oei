package global.oei.domain.shared.wallet;

import global.oei.domain.shared.membership.MembershipTier;

/**
 * Public verification result for a {@link WalletPass} looked up by serial number.
 */
public record WalletPassVerification(boolean valid, String memberPublicSlug, WalletPassStatus status, MembershipTier tier) {
}
