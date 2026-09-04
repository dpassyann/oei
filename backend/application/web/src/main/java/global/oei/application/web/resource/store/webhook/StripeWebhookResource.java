package global.oei.application.web.resource.store.webhook;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import global.oei.application.web.filter.CorrelationIdFilter;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.store.PaymentWebhookOutcome;
import global.oei.domain.shared.store.ProcessPaymentWebhookUseCase;

/**
 * Receives Stripe's asynchronous {@code payment_intent.succeeded}/
 * {@code payment_intent.payment_failed} webhook notifications.
 *
 * <p><b>Deliberate exception to this project's contract-first-OpenAPI convention:</b> every
 * other {@code *Resource} in this module implements a generated {@code *Api} interface with
 * typed DTOs (see {@code oei-api.yaml}). This endpoint cannot: Stripe signature verification
 * requires the exact raw bytes of the HTTP body <i>before</i> any JSON deserialization, which a
 * generator-produced, DTO-based controller cannot give us (Spring's message conversion already
 * consumed/re-serialized the body by the time a generated delegate sees it). It is therefore a
 * plain, hand-written {@code @RestController}, not generated, and is never added to
 * {@code oei-api.yaml}.</p>
 *
 * <p><b>Deliberate exception to "never a hand-rolled outbound client":</b> this is an
 * <i>inbound</i> endpoint, not an outbound call, so that convention does not apply here. No
 * {@code stripe-java} SDK dependency is introduced either way -- Stripe's webhook signature
 * scheme is a small, well-defined HMAC algorithm (see {@link StripeSignatureVerifier}), not a
 * client to generate.</p>
 *
 * <p>Reachable without a Keycloak bearer token (Stripe cannot authenticate that way): its path
 * falls under the existing {@code /api/public/**} allowlist entry in {@code application.yml}
 * (see the comment there) -- authenticity is instead guaranteed end-to-end by
 * {@link StripeSignatureVerifier}, which every request must pass before anything is parsed or
 * acted upon.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/public/v1/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookResource {

    /** Stripe's own recommended default replay-mitigation tolerance window. */
    private static final Duration SIGNATURE_TOLERANCE = Duration.ofMinutes(5);

    private static final String EVENT_SUCCEEDED = "payment_intent.succeeded";
    private static final String EVENT_FAILED = "payment_intent.payment_failed";

    private final ProcessPaymentWebhookUseCase processPaymentWebhookUseCase;
    private final ObjectMapper objectMapper;

    /**
     * No default placeholder on purpose: an unset/blank secret must fail closed (503), never
     * silently skip signature verification. See {@code application.yml}'s
     * {@code oei.security.stripe-webhook-secret} (backed by {@code OEI_STRIPE_WEBHOOK_SECRET}).
     */
    @Value("${oei.security.stripe-webhook-secret:}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<Void> handleStripeEvent(
            final HttpServletRequest request,
            @RequestHeader(name = "Stripe-Signature", required = false) final String signatureHeader) throws IOException {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("Rejecting Stripe webhook: OEI_STRIPE_WEBHOOK_SECRET is not configured -- failing closed, never skipping verification");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        // Read the exact raw bytes BEFORE any JSON parsing: Stripe's signature is computed over
        // this literal byte sequence, so re-serializing a parsed/deserialized body would break
        // verification for legitimate requests. Deliberately not a generated *Api DTO parameter
        // for the same reason -- see this class's Javadoc.
        final byte[] rawBody = request.getInputStream().readAllBytes();
        final String payload = new String(rawBody, StandardCharsets.UTF_8);

        final StripeSignatureVerifier.Result verification =
                StripeSignatureVerifier.verify(payload, signatureHeader, webhookSecret, Instant.now(), SIGNATURE_TOLERANCE);
        if (verification != StripeSignatureVerifier.Result.VALID) {
            log.warn("Rejecting Stripe webhook: {}", verification);
            return ResponseEntity.badRequest().build();
        }

        final JsonNode root;
        try {
            root = objectMapper.readTree(payload);
        } catch (final JacksonException _) {
            log.warn("Rejecting Stripe webhook: signature valid but payload is not parseable JSON");
            return ResponseEntity.badRequest().build();
        }

        final String eventId = root.path("id").asString(null);
        final String eventType = root.path("type").asString(null);
        final String paymentIntentId = root.path("data").path("object").path("id").asString(null);

        final PaymentWebhookOutcome outcome;
        if (EVENT_SUCCEEDED.equals(eventType)) {
            outcome = processPaymentWebhookUseCase.handleSucceeded(paymentIntentId, Instant.now());
        } else if (EVENT_FAILED.equals(eventType)) {
            // The minimal JSON contract this endpoint parses does not carry Stripe's granular
            // decline code -- see StripePaymentProviderAdapter's mapDeclineCode for that mapping
            // on the synchronous charge path. A documented simplification, not an oversight.
            outcome = processPaymentWebhookUseCase.handleFailed(paymentIntentId, PaymentFailureReason.UNKNOWN);
        } else {
            log.info("Ignoring Stripe event type '{}' (eventId={}): not handled by this webhook", eventType, eventId);
            return ResponseEntity.ok().build();
        }

        if (outcome == PaymentWebhookOutcome.PAYMENT_NOT_FOUND) {
            // Deliberately still 200: Stripe should not retry indefinitely for an event this
            // system does not act on. Never logs the signature, secret, or raw payload.
            final String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
            log.warn("Stripe webhook eventId={} correlationId={} references unknown payment providerReference={}",
                    eventId, correlationId, paymentIntentId);
        }
        return ResponseEntity.ok().build();
    }
}
