package global.oei.infrastructure.client.paypal;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import lombok.extern.slf4j.Slf4j;

/**
 * PayPal requires an OAuth2 client-credentials access token before any Orders v2 call; this
 * is deliberately a small hand-rolled cache (no full OAuth2 client library) rather than a
 * generated operation, since it is authentication plumbing, not one of the four domain
 * operations reduced into {@code paypal-api.yaml}. Thread-safe via a single synchronized
 * refresh path; good enough for this project's traffic profile.
 *
 * <p>Plain class, not a {@code @Component}: built explicitly by {@link PaypalClientConfiguration},
 * which owns the {@code @Value}-injected sandbox/production configuration.</p>
 */
@Slf4j
public class PaypalAccessTokenProvider {

    private static final long EXPIRY_SAFETY_MARGIN_SECONDS = 30;

    private final RestClient oauthRestClient;
    private final String clientId;
    private final String clientSecret;

    private volatile String cachedToken;
    private volatile Instant cachedTokenExpiresAt = Instant.EPOCH;

    public PaypalAccessTokenProvider(final String hostBaseUrl, final String clientId, final String clientSecret) {
        this.oauthRestClient = RestClient.builder().baseUrl(hostBaseUrl).build();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public synchronized String currentAccessToken() {
        if (cachedToken == null || Instant.now().isAfter(cachedTokenExpiresAt)) {
            refresh();
        }
        return cachedToken;
    }

    @SuppressWarnings("unchecked")
    private void refresh() {
        final MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        final Map<String, Object> response = oauthRestClient.post()
                .uri("/v1/oauth2/token")
                .headers(headers -> {
                    headers.setBasicAuth(clientId, clientSecret);
                    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                })
                .body(form)
                .retrieve()
                .body(Map.class);
        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException("PayPal OAuth2 token response did not contain an access_token");
        }
        cachedToken = (String) response.get("access_token");
        final Number expiresInSeconds = (Number) response.getOrDefault("expires_in", 0);
        cachedTokenExpiresAt = Instant.now().plusSeconds(Math.max(0, expiresInSeconds.longValue() - EXPIRY_SAFETY_MARGIN_SECONDS));
        log.debug("Refreshed PayPal OAuth2 access token, expires at {}", cachedTokenExpiresAt);
    }
}
