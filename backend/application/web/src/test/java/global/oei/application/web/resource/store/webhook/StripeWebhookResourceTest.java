package global.oei.application.web.resource.store.webhook;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.store.PaymentWebhookOutcome;
import global.oei.domain.shared.store.ProcessPaymentWebhookUseCase;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Standalone {@code MockMvc} test for {@link StripeWebhookResource} -- see
 * {@code ProfileImportResourceTest}'s Javadoc for why this style. Signatures are built by hand
 * with a known test secret (same HMAC scheme as {@link StripeSignatureVerifier}), no WireMock
 * needed for this inbound endpoint.
 */
class StripeWebhookResourceTest {

    private static final String SECRET = "whsec_test_secret";

    private ProcessPaymentWebhookUseCase processPaymentWebhookUseCase;
    private StripeWebhookResource resource;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        processPaymentWebhookUseCase = mock(ProcessPaymentWebhookUseCase.class);
        resource = new StripeWebhookResource(processPaymentWebhookUseCase, new ObjectMapper());
        ReflectionTestUtils.setField(resource, "webhookSecret", SECRET);
        mockMvc = MockMvcBuilders.standaloneSetup(resource).build();
    }

    @Test
    void handle_withValidSignature_dispatchesSucceededEventAndReturnsOk() throws Exception {
        final String payload = event("payment_intent.succeeded", "pi_123");
        when(processPaymentWebhookUseCase.handleSucceeded(eq("pi_123"), any())).thenReturn(PaymentWebhookOutcome.APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, Instant.now(), SECRET))
                        .content(payload))
                .andExpect(status().isOk());

        verify(processPaymentWebhookUseCase).handleSucceeded(eq("pi_123"), any());
    }

    @Test
    void handle_withValidSignature_dispatchesFailedEventAndReturnsOk() throws Exception {
        final String payload = event("payment_intent.payment_failed", "pi_456");
        when(processPaymentWebhookUseCase.handleFailed(eq("pi_456"), any())).thenReturn(PaymentWebhookOutcome.APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, Instant.now(), SECRET))
                        .content(payload))
                .andExpect(status().isOk());

        verify(processPaymentWebhookUseCase).handleFailed(eq("pi_456"), any(PaymentFailureReason.class));
    }

    @Test
    void handle_withInvalidSignature_returnsBadRequest() throws Exception {
        final String payload = event("payment_intent.succeeded", "pi_123");

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", "t=" + Instant.now().getEpochSecond() + ",v1=deadbeef")
                        .content(payload))
                .andExpect(status().isBadRequest());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
    }

    @Test
    void handle_withExpiredTimestamp_returnsBadRequest() throws Exception {
        final String payload = event("payment_intent.succeeded", "pi_123");
        final Instant tenMinutesAgo = Instant.now().minusSeconds(600);

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, tenMinutesAgo, SECRET))
                        .content(payload))
                .andExpect(status().isBadRequest());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
    }

    @Test
    void handle_withMissingOrBlankSecretConfigured_returnsServiceUnavailable() throws Exception {
        ReflectionTestUtils.setField(resource, "webhookSecret", "");
        final String payload = event("payment_intent.succeeded", "pi_123");

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, Instant.now(), SECRET))
                        .content(payload))
                .andExpect(status().isServiceUnavailable());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
    }

    @Test
    void handle_replayOfAnAlreadyTerminalPayment_isNoOpAndReturnsOk() throws Exception {
        final String payload = event("payment_intent.succeeded", "pi_123");
        when(processPaymentWebhookUseCase.handleSucceeded(eq("pi_123"), any())).thenReturn(PaymentWebhookOutcome.ALREADY_APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, Instant.now(), SECRET))
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void handle_unknownProviderReference_isLoggedAndReturnsOk() throws Exception {
        final String payload = event("payment_intent.succeeded", "pi_unknown");
        when(processPaymentWebhookUseCase.handleSucceeded(eq("pi_unknown"), any())).thenReturn(PaymentWebhookOutcome.PAYMENT_NOT_FOUND);

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, Instant.now(), SECRET))
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void handle_unknownEventType_isIgnoredAndReturnsOk() throws Exception {
        final String payload = event("payment_intent.created", "pi_123");

        mockMvc.perform(post("/api/public/v1/webhooks/stripe")
                        .header("Stripe-Signature", signatureHeader(payload, Instant.now(), SECRET))
                        .content(payload))
                .andExpect(status().isOk());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
        verify(processPaymentWebhookUseCase, never()).handleFailed(any(), any());
    }

    private static String event(final String type, final String paymentIntentId) {
        return """
                {"id":"evt_1","type":"%s","data":{"object":{"id":"%s","status":"pending"}}}
                """.formatted(type, paymentIntentId).strip();
    }

    private static String signatureHeader(final String payload, final Instant timestamp, final String secret) {
        final long epochSeconds = timestamp.getEpochSecond();
        return "t=" + epochSeconds + ",v1=" + hmac(epochSeconds + "." + payload, secret);
    }

    private static String hmac(final String signedPayload, final String secret) {
        try {
            final Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8)));
        } catch (final Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
