package global.oei.domain.core.store;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.function.UnaryOperator;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.domain.shared.store.PaymentPort;
import global.oei.domain.shared.store.PaymentWebhookOutcome;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProcessPaymentWebhookServiceTest {

    private static final String PROVIDER_REFERENCE = "pi_123";

    private final PaymentPort paymentPort = mock(PaymentPort.class);
    private final ProcessPaymentWebhookService service = new ProcessPaymentWebhookService(paymentPort);

    @Test
    void handleSucceeded_transitionsPendingPaymentToSucceeded() {
        stubLockAndApply(pendingPayment());
        final Instant succeededAt = Instant.now();

        final PaymentWebhookOutcome outcome = service.handleSucceeded(PROVIDER_REFERENCE, succeededAt);

        assertThat(outcome).isEqualTo(PaymentWebhookOutcome.APPLIED);
    }

    @Test
    void handleFailed_transitionsPendingPaymentToFailed() {
        stubLockAndApply(pendingPayment());

        final PaymentWebhookOutcome outcome = service.handleFailed(PROVIDER_REFERENCE, PaymentFailureReason.CARD_DECLINED);

        assertThat(outcome).isEqualTo(PaymentWebhookOutcome.APPLIED);
    }

    @Test
    void handleSucceeded_onAlreadySucceededPayment_isNoOpAndNeverThrows() {
        stubLockAndApply(pendingPayment().succeed("pi_123", Instant.now()));

        final PaymentWebhookOutcome outcome = service.handleSucceeded(PROVIDER_REFERENCE, Instant.now());

        assertThat(outcome).isEqualTo(PaymentWebhookOutcome.ALREADY_APPLIED);
    }

    @Test
    void handleFailed_onAlreadyFailedPayment_isNoOpAndNeverThrows() {
        stubLockAndApply(pendingPayment().fail(PaymentFailureReason.CARD_DECLINED));

        final PaymentWebhookOutcome outcome = service.handleFailed(PROVIDER_REFERENCE, PaymentFailureReason.CARD_DECLINED);

        assertThat(outcome).isEqualTo(PaymentWebhookOutcome.ALREADY_APPLIED);
    }

    @Test
    void handleSucceeded_onUnknownProviderReference_returnsPaymentNotFound() {
        when(paymentPort.lockAndApply(eq(PROVIDER_REFERENCE), any())).thenReturn(Optional.empty());

        final PaymentWebhookOutcome outcome = service.handleSucceeded(PROVIDER_REFERENCE, Instant.now());

        assertThat(outcome).isEqualTo(PaymentWebhookOutcome.PAYMENT_NOT_FOUND);
    }

    @Test
    void handleFailed_onUnknownProviderReference_returnsPaymentNotFound() {
        when(paymentPort.lockAndApply(eq(PROVIDER_REFERENCE), any())).thenReturn(Optional.empty());

        final PaymentWebhookOutcome outcome = service.handleFailed(PROVIDER_REFERENCE, PaymentFailureReason.UNKNOWN);

        assertThat(outcome).isEqualTo(PaymentWebhookOutcome.PAYMENT_NOT_FOUND);
    }

    /**
     * Regression test for the TOCTOU race fix: {@link ProcessPaymentWebhookService} must resolve
     * the payment exclusively through {@link PaymentPort#lockAndApply} -- a single atomic
     * read-decide-write -- and never through the separate, non-atomic
     * {@code findByProviderReference}/{@code save} pair, which is what allowed two concurrent
     * webhook deliveries to both observe {@code PENDING} and both apply a transition.
     */
    @Test
    void handleSucceeded_neverUsesTheNonAtomicFindThenSavePair() {
        stubLockAndApply(pendingPayment());

        service.handleSucceeded(PROVIDER_REFERENCE, Instant.now());

        verify(paymentPort, times(1)).lockAndApply(eq(PROVIDER_REFERENCE), any());
        verify(paymentPort, never()).findByProviderReference(any());
        verify(paymentPort, never()).save(any());
    }

    @Test
    void handleFailed_neverUsesTheNonAtomicFindThenSavePair() {
        stubLockAndApply(pendingPayment());

        service.handleFailed(PROVIDER_REFERENCE, PaymentFailureReason.CARD_DECLINED);

        verify(paymentPort, times(1)).lockAndApply(eq(PROVIDER_REFERENCE), any());
        verify(paymentPort, never()).findByProviderReference(any());
        verify(paymentPort, never()).save(any());
    }

    /**
     * Simulates the production {@code PaymentPersistenceAdapter#lockAndApply}'s real behaviour
     * (apply the caller's transition to the current payment under lock) so tests exercise the
     * exact same contract the production adapter fulfils.
     */
    private void stubLockAndApply(final Payment current) {
        when(paymentPort.lockAndApply(eq(PROVIDER_REFERENCE), any())).thenAnswer(invocation -> {
            final UnaryOperator<Payment> transition = invocation.getArgument(1);
            return Optional.of(transition.apply(current));
        });
    }

    private static Payment pendingPayment() {
        return new Payment(
                "pay1", "o1", PaymentMethod.CARD, PROVIDER_REFERENCE, new BigDecimal("9.90"), "EUR",
                PaymentStatus.PENDING, null, Instant.now(), null);
    }
}
