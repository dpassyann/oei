package global.oei.infrastructure.client.paypal;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

import global.oei.domain.shared.payment.ChargeRequest;
import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentProviderPort;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.infrastructure.client.paypal.generated.api.OrdersApi;
import global.oei.infrastructure.client.paypal.generated.api.PaymentsApi;
import global.oei.infrastructure.client.paypal.generated.model.PaypalOrderDto;
import global.oei.infrastructure.client.paypal.generated.model.PaypalRefundDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * {@link PaymentProviderPort} implementation for {@link PaymentMethod#PAYPAL}, backed by
 * PayPal's Orders v2 API. Maps every PayPal DTO/exception to {@code domain-shared} types at
 * this boundary — no generated PayPal type is ever returned from this class.
 *
 * <p><strong>V1 simplification (documented, not silent):</strong> the PayPal order itself is
 * assumed already created and approved client-side (via the PayPal JS SDK checkout button,
 * mirroring how Stripe.js already tokenizes the card client-side) before this backend is ever
 * called — {@link ChargeRequest#paymentToken()} carries that already-approved PayPal order id,
 * and {@link #charge(ChargeRequest)} only performs the server-side {@code capture} step.
 * Likewise, this reduced contract's {@code PaypalOrderDto} does not model the nested capture
 * id PayPal's real API returns, so the PayPal order id is reused directly as the
 * {@code providerReference}/refund capture reference — acceptable for V1's full-refund-only
 * posture, to revisit if PayPal's real, unreduced response shape is wired in later.</p>
 *
 * <p>Plain class, not a {@code @Component}: this project wires every adapter explicitly from
 * {@code OeiWiringConfiguration} (no cross-module classpath component scanning), so this bean
 * is registered there via an explicit {@code @Bean} method.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class PaypalPaymentProviderAdapter implements PaymentProviderPort {

    private static final String COMPLETED_STATUS = "COMPLETED";

    private final OrdersApi ordersApi;
    private final PaymentsApi paymentsApi;

    @Override
    public PaymentMethod supportedPaymentMethod() {
        return PaymentMethod.PAYPAL;
    }

    @Override
    public Payment charge(final ChargeRequest request) {
        final String paymentId = UUID.randomUUID().toString();
        final Instant createdAt = Instant.now();
        try {
            final ResponseEntity<PaypalOrderDto> response = ordersApi.capturePaypalOrder(request.paymentToken());
            final PaypalOrderDto order = response.getBody();
            if (order != null && COMPLETED_STATUS.equals(order.getStatus())) {
                return new Payment(paymentId, request.orderId(), PaymentMethod.PAYPAL, order.getId(), request.amount(),
                        request.currency(), PaymentStatus.SUCCEEDED, null, createdAt, Instant.now());
            }
            return failedPayment(paymentId, request, createdAt, PaymentFailureReason.CARD_DECLINED);
        } catch (final RestClientResponseException ex) {
            log.warn("PayPal order capture failed for order {}: HTTP {}", request.orderId(), ex.getStatusCode());
            final PaymentFailureReason reason = ex.getStatusCode().value() == 422
                    ? PaymentFailureReason.USER_CANCELLED
                    : PaymentFailureReason.UNKNOWN;
            return failedPayment(paymentId, request, createdAt, reason);
        } catch (final ResourceAccessException ex) {
            log.warn("PayPal order capture timed out for order {}", request.orderId(), ex);
            return failedPayment(paymentId, request, createdAt, PaymentFailureReason.PROVIDER_TIMEOUT);
        }
    }

    @Override
    public Payment refund(final Payment payment) {
        try {
            final ResponseEntity<PaypalRefundDto> response = paymentsApi.refundPaypalCapture(payment.providerReference(), null);
            final PaypalRefundDto refund = response.getBody();
            if (refund == null || !COMPLETED_STATUS.equals(refund.getStatus())) {
                throw new PaypalRefundFailedException(payment.providerReference());
            }
            return payment.refund();
        } catch (final RestClientResponseException | ResourceAccessException ex) {
            throw new PaypalRefundFailedException(payment.providerReference(), ex);
        }
    }

    private Payment failedPayment(final String paymentId, final ChargeRequest request, final Instant createdAt,
            final PaymentFailureReason reason) {
        return new Payment(paymentId, request.orderId(), PaymentMethod.PAYPAL, null, request.amount(), request.currency(),
                PaymentStatus.FAILED, reason, createdAt, null);
    }
}
