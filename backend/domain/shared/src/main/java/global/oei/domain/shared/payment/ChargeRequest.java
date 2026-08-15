package global.oei.domain.shared.payment;

import java.math.BigDecimal;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * Everything a {@link PaymentProviderPort} needs to initiate a charge for an order.
 *
 * <p>{@code paymentToken} is an opaque, already-tokenized reference to a payment method
 * (e.g. a Stripe.js {@code PaymentMethod}/{@code payment_method} id, or a PayPal order id
 * approved client-side) — this backend never receives, stores, or manipulates a raw card
 * number or CVV, consistent with standard PCI-DSS scoping for a Stripe/PayPal integration.</p>
 */
public record ChargeRequest(
        String orderId,
        MemberId memberId,
        BigDecimal amount,
        String currency,
        String paymentToken) {

    public ChargeRequest {
        Objects.requireNonNull(orderId, "orderId must not be null");
        Objects.requireNonNull(amount, "amount must not be null");
        Objects.requireNonNull(currency, "currency must not be null");
        Objects.requireNonNull(paymentToken, "paymentToken must not be null");
        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
    }
}
