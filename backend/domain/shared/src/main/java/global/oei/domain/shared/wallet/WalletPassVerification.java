package global.oei.domain.shared.wallet;

import global.oei.domain.shared.membership.MembershipTier;

public record WalletPassVerification(boolean valid, String memberPublicSlug, WalletPassStatus status, MembershipTier tier) {
}
