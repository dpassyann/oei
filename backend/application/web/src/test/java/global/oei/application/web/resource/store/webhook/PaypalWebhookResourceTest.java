package global.oei.application.web.resource.store.webhook;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaypalWebhookVerificationPort;
import global.oei.domain.shared.payment.PaypalWebhookVerificationRequest;
import global.oei.domain.shared.payment.PaypalWebhookVerificationResult;
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
 * Standalone {@code MockMvc} test for {@link PaypalWebhookResource} -- same style as
 * {@code StripeWebhookResourceTest}. Unlike Stripe, verification itself is delegated to
 * {@link PaypalWebhookVerificationPort} (an outbound API call), so it is mocked here rather
 * than computed locally -- {@code PaypalWebhookVerificationAdapterTest} (infrastructure-client)
 * is what exercises the real PayPal call against WireMock.
 */
class PaypalWebhookResourceTest {

    private static final String WEBHOOK_ID = "WH-TEST-1";

    private ProcessPaymentWebhookUseCase processPaymentWebhookUseCase;
    private PaypalWebhookVerificationPort paypalWebhookVerificationPort;
    private PaypalWebhookResource resource;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        processPaymentWebhookUseCase = mock(ProcessPaymentWebhookUseCase.class);
        paypalWebhookVerificationPort = mock(PaypalWebhookVerificationPort.class);
        resource = new PaypalWebhookResource(processPaymentWebhookUseCase, paypalWebhookVerificationPort, new ObjectMapper());
        ReflectionTestUtils.setField(resource, "webhookId", WEBHOOK_ID);
        mockMvc = MockMvcBuilders.standaloneSetup(resource).build();
    }

    @Test
    void handle_withValidVerification_dispatchesCaptureCompletedEventAndReturnsOk() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.SUCCESS);
        when(processPaymentWebhookUseCase.handleSucceeded(eq("CAPTURE-123"), any())).thenReturn(PaymentWebhookOutcome.APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isOk());

        verify(processPaymentWebhookUseCase).handleSucceeded(eq("CAPTURE-123"), any());
    }

    @Test
    void handle_withValidVerification_dispatchesCaptureDeniedEventAndReturnsOk() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.DENIED", "CAPTURE-456");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.SUCCESS);
        when(processPaymentWebhookUseCase.handleFailed(eq("CAPTURE-456"), any())).thenReturn(PaymentWebhookOutcome.APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isOk());

        verify(processPaymentWebhookUseCase).handleFailed(eq("CAPTURE-456"), any(PaymentFailureReason.class));
    }

    @Test
    void handle_forwardsHeadersAndRawBodyToTheVerificationPort() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.SUCCESS);
        when(processPaymentWebhookUseCase.handleSucceeded(any(), any())).thenReturn(PaymentWebhookOutcome.APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isOk());

        verify(paypalWebhookVerificationPort).verify(new PaypalWebhookVerificationRequest(
                "SHA256withRSA", "https://api.paypal.com/cert.pem", "tx-1", "sig-1", "2026-09-03T10:00:00Z",
                WEBHOOK_ID, payload));
    }

    @Test
    void handle_whenPaypalRejectsTheSignature_returnsBadRequest() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.FAILURE);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isBadRequest());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
    }

    @Test
    void handle_whenPaypalsVerificationApiIsUnavailable_failsClosedWithServiceUnavailable() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isServiceUnavailable());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
    }

    @Test
    void handle_withMissingOrBlankWebhookIdConfigured_returnsServiceUnavailable() throws Exception {
        ReflectionTestUtils.setField(resource, "webhookId", "");
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isServiceUnavailable());

        verify(paypalWebhookVerificationPort, never()).verify(any());
        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
    }

    @Test
    void handle_withMissingVerificationHeaders_returnsBadRequest() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");

        mockMvc.perform(post("/api/public/v1/webhooks/paypal").content(payload))
                .andExpect(status().isBadRequest());

        verify(paypalWebhookVerificationPort, never()).verify(any());
    }

    @Test
    void handle_replayOfAnAlreadyTerminalPayment_isNoOpAndReturnsOk() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-123");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.SUCCESS);
        when(processPaymentWebhookUseCase.handleSucceeded(eq("CAPTURE-123"), any())).thenReturn(PaymentWebhookOutcome.ALREADY_APPLIED);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void handle_unknownProviderReference_isLoggedAndReturnsOk() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.COMPLETED", "CAPTURE-unknown");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.SUCCESS);
        when(processPaymentWebhookUseCase.handleSucceeded(eq("CAPTURE-unknown"), any())).thenReturn(PaymentWebhookOutcome.PAYMENT_NOT_FOUND);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void handle_unknownEventType_isIgnoredAndReturnsOk() throws Exception {
        final String payload = event("PAYMENT.CAPTURE.PENDING", "CAPTURE-123");
        when(paypalWebhookVerificationPort.verify(any())).thenReturn(PaypalWebhookVerificationResult.SUCCESS);

        mockMvc.perform(post("/api/public/v1/webhooks/paypal")
                        .headers(paypalHeaders())
                        .content(payload))
                .andExpect(status().isOk());

        verify(processPaymentWebhookUseCase, never()).handleSucceeded(any(), any());
        verify(processPaymentWebhookUseCase, never()).handleFailed(any(), any());
    }

    private static org.springframework.http.HttpHeaders paypalHeaders() {
        final org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("PAYPAL-TRANSMISSION-ID", "tx-1");
        headers.add("PAYPAL-TRANSMISSION-TIME", "2026-09-03T10:00:00Z");
        headers.add("PAYPAL-CERT-URL", "https://api.paypal.com/cert.pem");
        headers.add("PAYPAL-AUTH-ALGO", "SHA256withRSA");
        headers.add("PAYPAL-TRANSMISSION-SIG", "sig-1");
        return headers;
    }

    private static String event(final String eventType, final String captureId) {
        return """
                {"id":"WH-EVT-1","event_type":"%s","resource":{"id":"%s","status":"pending"}}
                """.formatted(eventType, captureId).strip();
    }
}
