package global.oei.domain.shared.store;

/**
 * Admin-only, full-refund-only (see {@code 02-paiement.md §3}) action: resolves the
 * {@link global.oei.domain.shared.payment.PaymentMethod} that originally processed the order's
 * payment and asks that same provider to refund it.
 */
public interface RefundOrderUseCase {

    Order execute(String orderId);
}
