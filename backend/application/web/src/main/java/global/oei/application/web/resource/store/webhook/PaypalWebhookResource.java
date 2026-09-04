package global.oei.application.web.resource.store.webhook;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
import global.oei.domain.shared.payment.PaypalWebhookVerificationPort;
import global.oei.domain.shared.payment.PaypalWebhookVerificationRequest;
import global.oei.domain.shared.payment.PaypalWebhookVerificationResult;
import global.oei.domain.shared.store.PaymentWebhookOutcome;
import global.oei.domain.shared.store.ProcessPaymentWebhookUseCase;

/**
 * Receives PayPal's asynchronous {@code PAYMENT.CAPTURE.COMPLETED}/
 * {@code PAYMENT.CAPTURE.DENIED} webhook notifications.
 *
 * <p><b>Deliberate exception to this project's contract-first-OpenAPI convention</b> and to
 * "never a hand-rolled outbound client" for the same reasons documented on
 * {@code StripeWebhookResource}: a plain, hand-written {@code @RestController}, never added to
 * {@code oei-api.yaml}.</p>
 *
 * <p><b>Key difference from Stripe:</b> PayPal webhook signature verification is not a local
 * HMAC computation — it is itself an outbound call to PayPal's own
 * {@code POST /v1/notifications/verify-webhook-signature} API, delegated to
 * {@link PaypalWebhookVerificationPort} (implemented by
 * {@code PaypalWebhookVerificationAdapter} in {@code infrastructure-client}, a proper
 * contract-first generated client — see that module's {@code paypal-api.yaml}). This resource
 * never trusts the event content before that call reports
 * {@link PaypalWebhookVerificationResult#SUCCESS}, and never treats a verification API
 * error/timeout as success — see {@link PaypalWebhookVerificationResult}'s Javadoc.</p>
 *
 * <p>Reachable without a Keycloak bearer token (PayPal cannot authenticate that way): its path
 * falls under the existing {@code /api/public/**} allowlist entry in {@code application.yml}
 * (see the comment there), same posture as {@code StripeWebhookResource}.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/public/v1/webhooks/paypal")
@RequiredArgsConstructor
public class PaypalWebhookResource {

    private static final String EVENT_CAPTURE_COMPLETED = "PAYMENT.CAPTURE.COMPLETED";
    private static final String EVENT_CAPTURE_DENIED = "PAYMENT.CAPTURE.DENIED";

    private final ProcessPaymentWebhookUseCase processPaymentWebhookUseCase;
    private final PaypalWebhookVerificationPort paypalWebhookVerificationPort;
    private final ObjectMapper objectMapper;

    /**
     * No default placeholder on purpose (see {@code application.yml}'s
     * {@code oei.security.paypal-webhook-id}, backed by {@code OEI_PAYPAL_WEBHOOK_ID}): an
     * unset/blank webhook id must fail closed (503), never silently skip verification.
     */
    @Value("${oei.security.paypal-webhook-id:}")
    private String webhookId;

    @PostMapping
    public ResponseEntity<Void> handlePaypalEvent(
            final HttpServletRequest request,
            @RequestHeader(name = "PAYPAL-TRANSMISSION-ID", required = false) final String transmissionId,
            @RequestHeader(name = "PAYPAL-TRANSMISSION-TIME", required = false) final String transmissionTime,
            @RequestHeader(name = "PAYPAL-CERT-URL", required = false) final String certUrl,
            @RequestHeader(name = "PAYPAL-AUTH-ALGO", required = false) final String authAlgo,
            @RequestHeader(name = "PAYPAL-TRANSMISSION-SIG", required = false) final String transmissionSig) throws IOException {
        if (webhookId == null || webhookId.isBlank()) {
            log.error("Rejecting PayPal webhook: OEI_PAYPAL_WEBHOOK_ID is not configured -- failing closed, never skipping verification");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        if (transmissionId == null || transmissionTime == null || certUrl == null || authAlgo == null || transmissionSig == null) {
            log.warn("Rejecting PayPal webhook: missing one or more PAYPAL-* verification headers");
            return ResponseEntity.badRequest().build();
        }

        // Read the exact raw bytes and forward them unparsed as the verification call's
        // webhook_event field -- see PaypalWebhookVerificationRequest's Javadoc.
        final byte[] rawBody = request.getInputStream().readAllBytes();
        final String payload = new String(rawBody, StandardCharsets.UTF_8);

        final PaypalWebhookVerificationResult verification = paypalWebhookVerificationPort.verify(
                new PaypalWebhookVerificationRequest(authAlgo, certUrl, transmissionId, transmissionSig, transmissionTime, webhookId, payload));
        if (verification == PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE) {
            log.warn("Rejecting PayPal webhook: PayPal's verify-webhook-signature API could not be reached -- failing closed");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        if (verification == PaypalWebhookVerificationResult.FAILURE) {
            log.warn("Rejecting PayPal webhook: PayPal reported an invalid signature");
            return ResponseEntity.badRequest().build();
        }

        final JsonNode root;
        try {
            root = objectMapper.readTree(payload);
        } catch (final JacksonException e) {
            log.warn("Rejecting PayPal webhook: signature valid but payload is not parseable JSON");
            return ResponseEntity.badRequest().build();
        }

        final String eventId = root.path("id").asString(null);
        final String eventType = root.path("event_type").asString(null);
        final String captureId = root.path("resource").path("id").asString(null);

        final PaymentWebhookOutcome outcome;
        if (EVENT_CAPTURE_COMPLETED.equals(eventType)) {
            outcome = processPaymentWebhookUseCase.handleSucceeded(captureId, Instant.now());
        } else if (EVENT_CAPTURE_DENIED.equals(eventType)) {
            // The minimal JSON contract this endpoint parses does not carry a granular decline
            // reason -- see StripeWebhookResource's handleFailed call for the same documented
            // simplification on the Stripe side.
            outcome = processPaymentWebhookUseCase.handleFailed(captureId, PaymentFailureReason.UNKNOWN);
        } else {
            log.info("Ignoring PayPal event type '{}' (eventId={}): not handled by this webhook", eventType, eventId);
            return ResponseEntity.ok().build();
        }

        if (outcome == PaymentWebhookOutcome.PAYMENT_NOT_FOUND) {
            // Deliberately still 200: PayPal should not retry indefinitely for an event this
            // system does not act on. Never logs the signature, webhook id, or raw payload.
            final String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
            log.warn("PayPal webhook eventId={} correlationId={} references unknown payment providerReference={}",
                    eventId, correlationId, captureId);
        }
        return ResponseEntity.ok().build();
    }
}
