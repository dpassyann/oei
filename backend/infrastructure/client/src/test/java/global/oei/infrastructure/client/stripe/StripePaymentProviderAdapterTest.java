package global.oei.infrastructure.client.stripe;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
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
import global.oei.infrastructure.client.stripe.generated.api.PaymentIntentsApi;
import global.oei.infrastructure.client.stripe.generated.api.RefundsApi;

/**
 * Exercises {@link StripePaymentProviderAdapter} against a local WireMock stub — never a real
 * Stripe endpoint (even sandbox), per project policy.
 */
class StripePaymentProviderAdapterTest {

    private WireMockServer wireMockServer;
    private StripePaymentProviderAdapter adapter;

    @BeforeEach
    void startWireMock() {
        wireMockServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMockServer.start();

        final RestClient restClient = RestClient.builder()
                .baseUrl(wireMockServer.baseUrl())
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Bearer sk_test_placeholder");
                    return execution.execute(request, body);
                })
                .build();
        final HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient)).build();
        adapter = new StripePaymentProviderAdapter(factory.createClient(PaymentIntentsApi.class), factory.createClient(RefundsApi.class));
    }

    @AfterEach
    void stopWireMock() {
        wireMockServer.stop();
    }

    @Test
    void chargeReturnsSucceededPaymentWhenStripeConfirmsThePaymentIntent() {
        wireMockServer.stubFor(post(urlEqualTo("/payment_intents"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"id":"pi_123","object":"payment_intent","status":"succeeded","amount":1990,"currency":"eur"}
                                """)));

        final Payment payment = adapter.charge(new ChargeRequest("order-1", MemberId.newId(), new BigDecimal("19.90"), "eur", "pm_card_visa"));

        assertThat(payment.status()).isEqualTo(PaymentStatus.SUCCEEDED);
        assertThat(payment.providerReference()).isEqualTo("pi_123");
        assertThat(payment.paymentMethod()).isEqualTo(PaymentMethod.CARD);
    }

    @Test
    void chargeReturnsFailedPaymentWithCardDeclinedReasonWhenStripeDeclinesTheCard() {
        wireMockServer.stubFor(post(urlEqualTo("/payment_intents"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"id":"pi_456","object":"payment_intent","status":"requires_payment_method","amount":1990,
                                 "currency":"eur","last_payment_error":{"code":"card_declined","message":"Your card was declined.","type":"card_error"}}
                                """)));

        final Payment payment = adapter.charge(new ChargeRequest("order-2", MemberId.newId(), new BigDecimal("19.90"), "eur", "pm_card_declined"));

        assertThat(payment.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.failureReason()).isEqualTo(PaymentFailureReason.CARD_DECLINED);
    }

    @Test
    void chargeReturnsFailedPaymentWithProviderTimeoutReasonOnConnectionFailure() {
        wireMockServer.stop();

        final Payment payment = adapter.charge(new ChargeRequest("order-3", MemberId.newId(), new BigDecimal("5.00"), "eur", "pm_card_visa"));

        assertThat(payment.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.failureReason()).isEqualTo(PaymentFailureReason.PROVIDER_TIMEOUT);
    }
}
