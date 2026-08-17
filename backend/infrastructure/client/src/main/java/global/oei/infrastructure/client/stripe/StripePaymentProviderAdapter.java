package global.oei.infrastructure.client.stripe;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.payment.ChargeRequest;
import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentProviderPort;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.infrastructure.client.stripe.generated.api.PaymentIntentsApi;
import global.oei.infrastructure.client.stripe.generated.api.RefundsApi;
import global.oei.infrastructure.client.stripe.generated.model.StripePaymentIntentDto;
import global.oei.infrastructure.client.stripe.generated.model.StripeRefundDto;

/**
 * {@link PaymentProviderPort} implementation for {@link PaymentMethod#CARD}, backed by
 * Stripe's PaymentIntents API. Maps every Stripe DTO/exception to {@code domain-shared} types
 * at this boundary — no generated Stripe type is ever returned from this class.
 *
 * <p>Plain class, not a {@code @Component}: this project wires every adapter explicitly from
 * {@code OeiWiringConfiguration} (no cross-module classpath component scanning), so this bean
 * is registered there via an explicit {@code @Bean} method.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class StripePaymentProviderAdapter implements PaymentProviderPort {

    private final PaymentIntentsApi paymentIntentsApi;
    private final RefundsApi refundsApi;

    @Override
    public PaymentMethod supportedPaymentMethod() {
        return PaymentMethod.CARD;
    }

    @Override
    public Payment charge(final ChargeRequest request) {
        final String paymentId = UUID.randomUUID().toString();
        final Instant createdAt = Instant.now();
        try {
            final ResponseEntity<StripePaymentIntentDto> response = paymentIntentsApi.createPaymentIntent(
                    toMinorUnits(request.amount()), request.currency().toLowerCase(java.util.Locale.ROOT), request.paymentToken(), true);
            final StripePaymentIntentDto intent = response.getBody();
            return toPayment(paymentId, request, createdAt, intent);
        } catch (final RestClientResponseException ex) {
            log.warn("Stripe PaymentIntent creation failed for order {}: HTTP {}", request.orderId(), ex.getStatusCode());
            return failedPayment(paymentId, request, createdAt, mapHttpFailure(ex));
        } catch (final ResourceAccessException ex) {
            log.warn("Stripe PaymentIntent creation timed out for order {}", request.orderId(), ex);
            return failedPayment(paymentId, request, createdAt, PaymentFailureReason.PROVIDER_TIMEOUT);
        }
    }

    @Override
    public Payment refund(final Payment payment) {
        try {
            final ResponseEntity<StripeRefundDto> response = refundsApi.createRefund(payment.providerReference());
            final StripeRefundDto refund = response.getBody();
            if (refund == null || !"succeeded".equals(refund.getStatus())) {
                throw new StripeRefundFailedException(payment.providerReference());
            }
            return payment.refund();
        } catch (final RestClientResponseException | ResourceAccessException ex) {
            throw new StripeRefundFailedException(payment.providerReference(), ex);
        }
    }

    private Payment toPayment(final String paymentId, final ChargeRequest request, final Instant createdAt,
            final StripePaymentIntentDto intent) {
        if (intent != null && "succeeded".equals(intent.getStatus())) {
            return new Payment(paymentId, request.orderId(), PaymentMethod.CARD, intent.getId(), request.amount(),
                    request.currency(), PaymentStatus.SUCCEEDED, null, createdAt, Instant.now());
        }
        final PaymentFailureReason reason = intent != null && intent.getLastPaymentError() != null
                ? mapDeclineCode(intent.getLastPaymentError().getCode())
                : PaymentFailureReason.UNKNOWN;
        return failedPayment(paymentId, request, createdAt, reason);
    }

    private Payment failedPayment(final String paymentId, final ChargeRequest request, final Instant createdAt,
            final PaymentFailureReason reason) {
        return new Payment(paymentId, request.orderId(), PaymentMethod.CARD, null, request.amount(), request.currency(),
                PaymentStatus.FAILED, reason, createdAt, null);
    }

    private PaymentFailureReason mapHttpFailure(final RestClientResponseException ex) {
        if (ex.getStatusCode().is4xxClientError()) {
            return PaymentFailureReason.CARD_DECLINED;
        }
        return PaymentFailureReason.UNKNOWN;
    }

    private PaymentFailureReason mapDeclineCode(final String stripeErrorCode) {
        if (stripeErrorCode == null) {
            return PaymentFailureReason.UNKNOWN;
        }
        return switch (stripeErrorCode) {
            case "card_declined", "expired_card", "incorrect_cvc" -> PaymentFailureReason.CARD_DECLINED;
            default -> PaymentFailureReason.UNKNOWN;
        };
    }

    /**
     * Stripe amounts are expressed in the smallest currency unit (e.g. cents); the domain
     * carries a decimal {@link BigDecimal} amount, so this converts at the adapter boundary
     * only — never inside domain-shared.
     */
    private long toMinorUnits(final BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }
}
