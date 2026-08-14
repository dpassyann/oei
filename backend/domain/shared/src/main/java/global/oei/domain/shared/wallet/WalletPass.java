package global.oei.domain.shared.wallet;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's Apple/Google Wallet pass. {@link #mocked()} is always {@code true} in this
 * iteration: no real signed {@code .pkpass} is generated (no publisher certificate
 * available) — see {@code CreateWalletPassService}, the sole place allowed to construct
 * one, which enforces this invariant. Never to be presented as an official identity
 * document.
 */
public record WalletPass(
        String id,
        MemberId memberId,
        WalletPassProvider provider,
        WalletPassStatus status,
        String serialNumber,
        String verificationUrl,
        String levelColor,
        Instant issuedAt,
        Instant revokedAt,
        boolean mocked) {

    public WalletPass {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(provider, "provider must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(serialNumber, "serialNumber must not be null");
    }

    /**
     * @return a new instance with {@link #status()} set to {@link WalletPassStatus#REVOKED}
     *         and {@link #revokedAt()} set to {@code revokedAt}; every other field unchanged
     */
    public WalletPass revoke(final Instant revokedAt) {
        return new WalletPass(
                id, memberId, provider, WalletPassStatus.REVOKED, serialNumber, verificationUrl, levelColor, issuedAt,
                revokedAt, mocked);
    }
}
