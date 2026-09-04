package global.oei.application.web.resource.store.webhook;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link StripeSignatureVerifier}, built against Stripe's own documented
 * webhook signature scheme: build the real HMAC ourselves with a known test secret and assert
 * both accepted and rejected cases -- no WireMock needed for an inbound endpoint.
 */
class StripeSignatureVerifierTest {

    private static final String SECRET = "whsec_test_secret";
    private static final Duration TOLERANCE = Duration.ofMinutes(5);

    @Test
    void verify_acceptsAValidSignature() {
        final String payload = "{\"id\":\"evt_1\"}";
        final Instant now = Instant.now();
        final String header = signatureHeader(payload, now, SECRET);

        final StripeSignatureVerifier.Result result = StripeSignatureVerifier.verify(payload, header, SECRET, now, TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.VALID);
    }

    @Test
    void verify_acceptsWhenAnyOfMultipleV1ValuesMatches_secretRotationCase() {
        final String payload = "{\"id\":\"evt_1\"}";
        final Instant now = Instant.now();
        final String validV1 = hmac(now.getEpochSecond() + "." + payload, SECRET);
        final String header = "t=" + now.getEpochSecond() + ",v1=deadbeef,v1=" + validV1;

        final StripeSignatureVerifier.Result result = StripeSignatureVerifier.verify(payload, header, SECRET, now, TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.VALID);
    }

    @Test
    void verify_rejectsWhenNoV1ValueMatches() {
        final String payload = "{\"id\":\"evt_1\"}";
        final Instant now = Instant.now();
        final String header = "t=" + now.getEpochSecond() + ",v1=deadbeef";

        final StripeSignatureVerifier.Result result = StripeSignatureVerifier.verify(payload, header, SECRET, now, TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.INVALID_SIGNATURE);
    }

    @Test
    void verify_rejectsWhenSignedWithADifferentSecret() {
        final String payload = "{\"id\":\"evt_1\"}";
        final Instant now = Instant.now();
        final String header = signatureHeader(payload, now, "whsec_other_secret");

        final StripeSignatureVerifier.Result result = StripeSignatureVerifier.verify(payload, header, SECRET, now, TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.INVALID_SIGNATURE);
    }

    @Test
    void verify_rejectsAnExpiredTimestamp() {
        final String payload = "{\"id\":\"evt_1\"}";
        final Instant now = Instant.now();
        final Instant tenMinutesAgo = now.minus(Duration.ofMinutes(10));
        final String header = signatureHeader(payload, tenMinutesAgo, SECRET);

        final StripeSignatureVerifier.Result result = StripeSignatureVerifier.verify(payload, header, SECRET, now, TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.EXPIRED_TIMESTAMP);
    }

    @Test
    void verify_rejectsAMalformedHeader() {
        final StripeSignatureVerifier.Result result =
                StripeSignatureVerifier.verify("{}", "not-a-stripe-signature", SECRET, Instant.now(), TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.MALFORMED_HEADER);
    }

    @Test
    void verify_rejectsANullHeader() {
        final StripeSignatureVerifier.Result result =
                StripeSignatureVerifier.verify("{}", null, SECRET, Instant.now(), TOLERANCE);

        assertThat(result).isEqualTo(StripeSignatureVerifier.Result.MALFORMED_HEADER);
    }

    private static String signatureHeader(final String payload, final Instant timestamp, final String secret) {
        final long epochSeconds = timestamp.getEpochSecond();
        final String signature = hmac(epochSeconds + "." + payload, secret);
        return "t=" + epochSeconds + ",v1=" + signature;
    }

    private static String hmac(final String signedPayload, final String secret) {
        try {
            final Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            final byte[] digest = mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (final Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
