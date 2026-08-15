package global.oei.infrastructure.client.stripe;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import global.oei.infrastructure.client.stripe.generated.api.PaymentIntentsApi;
import global.oei.infrastructure.client.stripe.generated.api.RefundsApi;

/**
 * Wires the generated {@code spring-http-interface} Stripe client interfaces onto a single
 * {@link RestClient}, authenticated with a bearer secret key injected via
 * {@code OEI_STRIPE_API_KEY} (never hardcoded, never logged). The
 * {@code sk_test_placeholder}/sandbox base URL defaults below are dev-only and must be
 * overridden in production, same posture as {@code OEI_DB_PASSWORD} in application.yml.
 */
@Configuration
public class StripeClientConfiguration {

    @Bean
    RestClient stripeRestClient(
            @Value("${oei.payment.stripe.api-base-url:https://api.stripe.com/v1}") final String apiBaseUrl,
            @Value("${oei.payment.stripe.api-key:sk_test_placeholder}") final String apiKey) {
        return RestClient.builder()
                .baseUrl(apiBaseUrl)
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
                    return execution.execute(request, body);
                })
                .build();
    }

    @Bean
    PaymentIntentsApi paymentIntentsApi(final RestClient stripeRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(stripeRestClient))
                .build()
                .createClient(PaymentIntentsApi.class);
    }

    @Bean
    RefundsApi refundsApi(final RestClient stripeRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(stripeRestClient))
                .build()
                .createClient(RefundsApi.class);
    }
}
