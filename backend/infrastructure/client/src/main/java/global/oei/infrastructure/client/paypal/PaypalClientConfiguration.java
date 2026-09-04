package global.oei.infrastructure.client.paypal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import global.oei.infrastructure.client.paypal.generated.api.NotificationsApi;
import global.oei.infrastructure.client.paypal.generated.api.OrdersApi;
import global.oei.infrastructure.client.paypal.generated.api.PaymentsApi;

/**
 * Wires the generated {@code spring-http-interface} PayPal Orders v2 client interfaces onto
 * a single {@link RestClient}, authenticated with a bearer OAuth2 access token obtained/cached
 * by {@link PaypalAccessTokenProvider} (never hardcoded, never logged). The sandbox host
 * default below is dev-only and must be overridden in production.
 *
 * <p>{@link NotificationsApi} (webhook signature verification) is wired onto a second
 * {@link RestClient}, based at PayPal's {@code /v1} host rather than {@code /v2} like
 * Orders/Payments above — see the file-header comment in {@code paypal-api.yaml} for why the
 * contract's path is version-agnostic and the base URL alone carries that distinction.</p>
 */
@Configuration
public class PaypalClientConfiguration {

    @Bean
    PaypalAccessTokenProvider paypalAccessTokenProvider(
            @Value("${oei.payment.paypal.host-base-url:https://api-m.sandbox.paypal.com}") final String hostBaseUrl,
            @Value("${oei.payment.paypal.client-id:paypal_client_id_placeholder}") final String clientId,
            @Value("${oei.payment.paypal.client-secret:paypal_client_secret_placeholder}") final String clientSecret) {
        return new PaypalAccessTokenProvider(hostBaseUrl, clientId, clientSecret);
    }

    @Bean
    RestClient paypalRestClient(
            @Value("${oei.payment.paypal.host-base-url:https://api-m.sandbox.paypal.com}") final String hostBaseUrl,
            final PaypalAccessTokenProvider accessTokenProvider) {
        return RestClient.builder()
                .baseUrl(hostBaseUrl + "/v2")
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().setBearerAuth(accessTokenProvider.currentAccessToken());
                    return execution.execute(request, body);
                })
                .build();
    }

    @Bean
    OrdersApi ordersApi(final RestClient paypalRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(paypalRestClient))
                .build()
                .createClient(OrdersApi.class);
    }

    @Bean
    PaymentsApi paymentsApi(final RestClient paypalRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(paypalRestClient))
                .build()
                .createClient(PaymentsApi.class);
    }

    @Bean
    RestClient paypalNotificationsRestClient(
            @Value("${oei.payment.paypal.host-base-url:https://api-m.sandbox.paypal.com}") final String hostBaseUrl,
            final PaypalAccessTokenProvider accessTokenProvider) {
        return RestClient.builder()
                .baseUrl(hostBaseUrl + "/v1")
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().setBearerAuth(accessTokenProvider.currentAccessToken());
                    return execution.execute(request, body);
                })
                .build();
    }

    @Bean
    NotificationsApi notificationsApi(final RestClient paypalNotificationsRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(paypalNotificationsRestClient))
                .build()
                .createClient(NotificationsApi.class);
    }
}
