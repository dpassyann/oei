package global.oei.application.web.resource.store.webhook;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Verifies Stripe's {@code Stripe-Signature} webhook header, implemented by hand against
 * Stripe's own documented scheme (see {@code StripeWebhookResource}'s Javadoc for why the
 * {@code stripe-java} SDK is deliberately not used for this): the header has the form
 * {@code t=<timestamp>,v1=<hex-hmac-sha256>[,v1=<...>]} (multiple {@code v1} values occur
 * during secret rotation -- accept if ANY matches), and the signed payload is the ASCII string
 * {@code "{timestamp}.{raw_body}"}, HMAC-SHA256 keyed with the webhook secret.
 *
 * <p>Pure/stateless by design (no Spring dependency) so it is trivially unit-testable by
 * constructing a real signature with a known test secret.</p>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class StripeSignatureVerifier {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    public enum Result {
        VALID,
        /** Header present and well-formed, but no {@code v1} value matches the computed HMAC. */
        INVALID_SIGNATURE,
        /** The signed timestamp is outside the accepted tolerance window (replay mitigation). */
        EXPIRED_TIMESTAMP,
        /** The header is missing, blank, or does not carry a parseable {@code t=}/{@code v1=} pair. */
        MALFORMED_HEADER
    }

    public static Result verify(
            final String payload, final String signatureHeader, final String secret,
            final Instant now, final Duration tolerance) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return Result.MALFORMED_HEADER;
        }

        Long timestampEpochSeconds = null;
        final List<String> candidateSignatures = new ArrayList<>();
        for (final String element : signatureHeader.split(",")) {
            final String[] parts = element.split("=", 2);
            if (parts.length != 2) {
                continue;
            }
            final String key = parts[0].trim();
            final String value = parts[1].trim();
            if ("t".equals(key)) {
                timestampEpochSeconds = parseLongOrNull(value);
            } else if ("v1".equals(key)) {
                candidateSignatures.add(value);
            }
        }

        if (timestampEpochSeconds == null || candidateSignatures.isEmpty()) {
            return Result.MALFORMED_HEADER;
        }

        final Instant signedAt = Instant.ofEpochSecond(timestampEpochSeconds);
        final Duration age = Duration.between(signedAt, now).abs();
        if (age.compareTo(tolerance) > 0) {
            return Result.EXPIRED_TIMESTAMP;
        }

        final String signedPayload = timestampEpochSeconds + "." + payload;
        final byte[] expectedDigest = hmacSha256(signedPayload, secret);

        for (final String candidate : candidateSignatures) {
            final byte[] candidateDigest = decodeHexOrNull(candidate);
            if (candidateDigest != null && MessageDigest.isEqual(expectedDigest, candidateDigest)) {
                return Result.VALID;
            }
        }
        return Result.INVALID_SIGNATURE;
    }

    private static byte[] hmacSha256(final String data, final String secret) {
        try {
            final Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (final java.security.GeneralSecurityException e) {
            // HmacSHA256 is a mandatory JCA algorithm on every JVM -- this can only happen due
            // to a misconfigured security provider, which is an unrecoverable startup issue.
            throw new IllegalStateException("HmacSHA256 unavailable", e);
        }
    }

    private static byte[] decodeHexOrNull(final String hex) {
        try {
            return HexFormat.of().parseHex(hex);
        } catch (final IllegalArgumentException e) {
            return null;
        }
    }

    private static Long parseLongOrNull(final String value) {
        try {
            return Long.parseLong(value);
        } catch (final NumberFormatException e) {
            return null;
        }
    }
}
