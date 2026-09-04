package global.oei.infrastructure.client.paypal;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalToJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;

import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.payment.PaypalWebhookVerificationRequest;
import global.oei.domain.shared.payment.PaypalWebhookVerificationResult;
import global.oei.infrastructure.client.paypal.generated.api.NotificationsApi;

/**
 * Exercises {@link PaypalWebhookVerificationAdapter} against a local WireMock stub — never a
 * real PayPal endpoint (even sandbox), per project policy, matching
 * {@link PaypalPaymentProviderAdapterTest}'s style.
 */
class PaypalWebhookVerificationAdapterTest {

    private WireMockServer wireMockServer;
    private PaypalWebhookVerificationAdapter adapter;

    @BeforeEach
    void startWireMock() {
        wireMockServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMockServer.start();

        // Explicit SimpleClientHttpRequestFactory: RestClient's default request factory (the
        // JDK HttpClient) attempts an HTTP/2 upgrade that WireMock's embedded server does not
        // handle cleanly for POST-with-body requests, surfacing as a spurious
        // ResourceAccessException("EOF reached while reading") that has nothing to do with the
        // adapter under test.
        final RestClient restClient = RestClient.builder()
                .requestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory())
                .baseUrl(wireMockServer.baseUrl()).build();
        final HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient)).build();
        adapter = new PaypalWebhookVerificationAdapter(factory.createClient(NotificationsApi.class), new ObjectMapper());
    }

    @AfterEach
    void stopWireMock() {
        wireMockServer.stop();
    }

    @Test
    void verify_returnsSuccess_whenPaypalConfirmsTheSignature() {
        wireMockServer.stubFor(post(urlEqualTo("/notifications/verify-webhook-signature"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"verification_status":"SUCCESS"}
                                """)));

        final PaypalWebhookVerificationResult result = adapter.verify(request());

        assertThat(result).isEqualTo(PaypalWebhookVerificationResult.SUCCESS);
    }

    @Test
    void verify_forwardsTheHeadersAndRawEventBodyAsWebhookEvent() {
        wireMockServer.stubFor(post(urlEqualTo("/notifications/verify-webhook-signature"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"verification_status":"SUCCESS"}
                                """)));

        adapter.verify(request());

        wireMockServer.verify(postRequestedFor(urlEqualTo("/notifications/verify-webhook-signature"))
                .withRequestBody(equalToJson("""
                        {
                          "auth_algo":"SHA256withRSA",
                          "cert_url":"https://api.paypal.com/cert.pem",
                          "transmission_id":"tx-1",
                          "transmission_sig":"sig-1",
                          "transmission_time":"2026-09-03T10:00:00Z",
                          "webhook_id":"WH-1",
                          "webhook_event":{"id":"evt_1","event_type":"PAYMENT.CAPTURE.COMPLETED"}
                        }
                        """, true, true)));
    }

    @Test
    void verify_returnsFailure_whenPaypalRejectsTheSignature() {
        wireMockServer.stubFor(post(urlEqualTo("/notifications/verify-webhook-signature"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                                {"verification_status":"FAILURE"}
                                """)));

        final PaypalWebhookVerificationResult result = adapter.verify(request());

        assertThat(result).isEqualTo(PaypalWebhookVerificationResult.FAILURE);
    }

    @Test
    void verify_returnsVerificationUnavailable_onNon2xxResponse() {
        wireMockServer.stubFor(post(urlEqualTo("/notifications/verify-webhook-signature"))
                .willReturn(aResponse().withStatus(500)));

        final PaypalWebhookVerificationResult result = adapter.verify(request());

        assertThat(result).isEqualTo(PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE);
    }

    @Test
    void verify_returnsVerificationUnavailable_onConnectionFailure() {
        wireMockServer.stop();

        final PaypalWebhookVerificationResult result = adapter.verify(request());

        assertThat(result).isEqualTo(PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE);
    }

    @Test
    void verify_returnsVerificationUnavailable_whenRawEventBodyIsNotValidJson() {
        final PaypalWebhookVerificationRequest malformed = new PaypalWebhookVerificationRequest(
                "SHA256withRSA", "https://api.paypal.com/cert.pem", "tx-1", "sig-1",
                "2026-09-03T10:00:00Z", "WH-1", "not-json");

        final PaypalWebhookVerificationResult result = adapter.verify(malformed);

        assertThat(result).isEqualTo(PaypalWebhookVerificationResult.VERIFICATION_UNAVAILABLE);
    }

    private static PaypalWebhookVerificationRequest request() {
        return new PaypalWebhookVerificationRequest(
                "SHA256withRSA",
                "https://api.paypal.com/cert.pem",
                "tx-1",
                "sig-1",
                "2026-09-03T10:00:00Z",
                "WH-1",
                """
                {"id":"evt_1","event_type":"PAYMENT.CAPTURE.COMPLETED"}
                """.strip());
    }
}
