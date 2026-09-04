package global.oei.infrastructure.client.paypal;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.payment.PaypalWebhookVerificationPort;
import global.oei.domain.shared.payment.PaypalWebhookVerificationRequest;
import global.oei.domain.shared.payment.PaypalWebhookVerificationResult;
import global.oei.infrastructure.client.paypal.generated.api.NotificationsApi;
import global.oei.infrastructure.client.paypal.generated.model.PaypalVerifyWebhookSignatureResponseDto;
import global.oei.infrastructure.client.paypal.generated.model.VerifyPaypalWebhookSignatureRequestDto;

/**
 * {@link PaypalWebhookVerificationPort} implementation backed by PayPal's own
 * {@code POST /v1/notifications/verify-webhook-signature} API — unlike Stripe, PayPal webhook
 * signature verification is not a local HMAC computation, it is itself an outbound API call
 * (see {@code PaypalWebhookResource}'s Javadoc for the full rationale).
 *
 * <p><b>Fails closed, never open:</b> any error calling PayPal (network/timeout, non-2xx, a
 * malformed response body, or a {@code webhook_event} payload that is not valid JSON) yields
 * {@link PaypalWebhookVerificationResult#VERIFICATION_UNAVAILABLE}, never
 * {@link PaypalWebhookVerificationResult#SUCCESS} — the event content must never be trusted
 * just because PayPal could not be reached.</p>
 *
 * <p>Plain class, not a {@code @Component}: wired explicitly from
 * {@code OeiWiringConfiguration}, consistent with every other adapter in this module.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class PaypalWebhookVerificationAdapter implements PaypalWebhookVerificationPort {

    private static final String SUCCESS_STATUS = "SUCCESS";
    private static final String FAILURE_STATUS = "FAILURE";

    private final NotificationsApi notificationsApi;
    private final ObjectMapper objectMapper;

    @Override
    @SuppressWarnings("unchecked")
    public PaypalWebhookVerificationResult verify(final PaypalWebhookVerificationRequest request) {
        final Map<String, Object> webhookEvent;
        try {
            webhookEvent = objectMapper.readValue(request.rawEventBody(), Map.class);
        } catch (final JacksonException e) {
            log.warn("Rejecting PayPal webhook verification call: raw event body is not valid JSON");
            return PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE;
        }

        final VerifyPaypalWebhookSignatureRequestDto verifyRequest = new VerifyPaypalWebhookSignatureRequestDto(
                request.authAlgo(), request.certUrl(), request.transmissionId(), request.transmissionSig(),
                request.transmissionTime(), request.webhookId(), webhookEvent);

        try {
            final ResponseEntity<PaypalVerifyWebhookSignatureResponseDto> response =
                    notificationsApi.verifyPaypalWebhookSignature(verifyRequest);
            final PaypalVerifyWebhookSignatureResponseDto body = response.getBody();
            if (body == null) {
                log.warn("PayPal webhook verification call returned an empty body");
                return PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE;
            }
            if (SUCCESS_STATUS.equals(body.getVerificationStatus())) {
                return PaypalWebhookVerificationResult.SUCCESS;
            }
            if (FAILURE_STATUS.equals(body.getVerificationStatus())) {
                return PaypalWebhookVerificationResult.FAILURE;
            }
            log.warn("PayPal webhook verification call returned an unexpected verification_status");
            return PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE;
        } catch (final RestClientResponseException ex) {
            log.warn("PayPal webhook verification call failed: HTTP {}", ex.getStatusCode());
            return PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE;
        } catch (final ResourceAccessException ex) {
            log.warn("PayPal webhook verification call timed out or could not connect", ex);
            return PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE;
        }
    }
}
