package global.oei.infrastructure.client.linkedin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import global.oei.infrastructure.client.linkedin.generated.api.UserInfoApi;

/**
 * Wires LinkedIn identity HTTP client used by smart-onboarding (LinkedIn basic profile path).
 *
 * <p>Default base URL points to LinkedIn OpenID userinfo host and should be overridden per
 * environment if needed.</p>
 */
@Configuration
public class LinkedinClientConfiguration {

    @Bean
    RestClient linkedinRestClient(
            @Value("${oei.linkedin.api-base-url:https://api.linkedin.com}") final String apiBaseUrl) {
        return RestClient.builder()
                .baseUrl(apiBaseUrl)
                .build();
    }

    @Bean
    RestClient linkedinOauthRestClient(
            @Value("${oei.linkedin.oauth.base-url:https://www.linkedin.com}") final String oauthBaseUrl) {
        return RestClient.builder()
                .baseUrl(oauthBaseUrl)
                .build();
    }

    @Bean
    UserInfoApi userInfoApi(final RestClient linkedinRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(linkedinRestClient))
                .build()
                .createClient(UserInfoApi.class);
    }

    @Bean
    LinkedinProfileClient linkedinProfileClient(final UserInfoApi userInfoApi) {
        return new LinkedinProfileClient(userInfoApi);
    }

    @Bean
    LinkedinAuthorizationClient linkedinAuthorizationClient(
            final RestClient linkedinOauthRestClient,
            @Value("${oei.linkedin.oauth.client-id:}") final String clientId,
            @Value("${oei.linkedin.oauth.client-secret:}") final String clientSecret) {
        return new LinkedinAuthorizationClient(linkedinOauthRestClient, clientId, clientSecret);
    }
}

