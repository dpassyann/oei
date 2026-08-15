package global.oei.infrastructure.client.paypal;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.payment.ChargeRequest;
import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.infrastructure.client.paypal.generated.api.OrdersApi;
import global.oei.infrastructure.client.paypal.generated.api.PaymentsApi;

/**
 * Exercises {@link PaypalPaymentProviderAdapter} against a local WireMock stub — never a real
 * PayPal endpoint (even sandbox), per project policy. No OAuth2 token endpoint is stubbed
 * here since {@link PaypalPaymentProviderAdapter} itself never calls
 * {@link PaypalAccessTokenProvider} directly (the bearer header is injected upstream by
 * {@code PaypalClientConfiguration}) — this test wires the generated clients straight onto
 * WireMock without that interceptor, matching the adapter's own contract in isolation.
 */
class PaypalPaymentProviderAdapterTest {

    private WireMockServer wireMockServer;
    private PaypalPaymentProviderAdapter adapter;

    @BeforeEach
    void startWireMock() {
        wireMockServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMockServer.start();

        final RestClient restClient = RestClient.builder().baseUrl(wireMockServer.baseUrl()).build();
        final HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient)).build();
        adapter = new PaypalPaymentProviderAdapter(factory.createClient(OrdersApi.class), factory.createClient(PaymentsApi.class));
    }

    @AfterEach
    void stopWireMock() {
        wireMockServer.stop();
    }

    @Test
    void chargeReturnsSucceededPaymentWhenPaypalCapturesTheOrder() {
        wireMockServer.stubFor(post(urlEqualTo("/checkout/orders/EC-123/capture"))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"id":"EC-123","status":"COMPLETED"}
                                """)));

        final Payment payment = adapter.charge(new ChargeRequest("order-1", MemberId.newId(), new BigDecimal("19.90"), "EUR", "EC-123"));

        assertThat(payment.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        assertThat(payment.providerReference()).isEqualTo("EC-123");
        assertThat(payment.paymentMethod()).isEqualTo(PaymentMethod.PAYPAL);
    }

    @Test
    void chargeReturnsFailedPaymentWhenPaypalOrderIsNotCompleted() {
        wireMockServer.stubFor(post(urlEqualTo("/checkout/orders/EC-456/capture"))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"id":"EC-456","status":"VOIDED"}
                                """)));

        final Payment payment = adapter.charge(new ChargeRequest("order-2", MemberId.newId(), new BigDecimal("19.90"), "EUR", "EC-456"));

        assertThat(payment.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.failureReason()).isEqualTo(PaymentFailureReason.CARD_DECLINED);
    }

    @Test
    void chargeReturnsFailedPaymentWithProviderTimeoutReasonOnConnectionFailure() {
        wireMockServer.stop();

        final Payment payment = adapter.charge(new ChargeRequest("order-3", MemberId.newId(), new BigDecimal("5.00"), "EUR", "EC-789"));

        assertThat(payment.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.failureReason()).isEqualTo(PaymentFailureReason.PROVIDER_TIMEOUT);
    }
}
