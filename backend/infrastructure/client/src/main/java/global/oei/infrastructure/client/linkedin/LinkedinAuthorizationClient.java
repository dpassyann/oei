package global.oei.infrastructure.client.linkedin;

import java.util.Map;
import java.util.Objects;

import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import global.oei.domain.shared.profile.LinkedinAuthorizationPort;

/**
 * LinkedIn OAuth adapter exchanging an authorization code for an access token.
 */
public class LinkedinAuthorizationClient implements LinkedinAuthorizationPort {

    private final RestClient oauthRestClient;
    private final String clientId;
    private final String clientSecret;

    public LinkedinAuthorizationClient(
            final RestClient oauthRestClient,
            final String clientId,
            final String clientSecret) {
        this.oauthRestClient = Objects.requireNonNull(oauthRestClient, "oauthRestClient must not be null");
        this.clientId = Objects.requireNonNull(clientId, "clientId must not be null").trim();
        this.clientSecret = Objects.requireNonNull(clientSecret, "clientSecret must not be null").trim();
    }

    @Override
    @SuppressWarnings("unchecked")
    public String exchangeAuthorizationCode(final String authorizationCode, final String redirectUri) {
        final String code = Objects.requireNonNull(authorizationCode, "authorizationCode must not be null").trim();
        final String callbackRedirectUri = Objects.requireNonNull(redirectUri, "redirectUri must not be null").trim();
        if (code.isEmpty()) {
            throw new IllegalArgumentException("authorizationCode must not be blank");
        }
        if (callbackRedirectUri.isEmpty()) {
            throw new IllegalArgumentException("redirectUri must not be blank");
        }
        if (clientId.isEmpty() || clientSecret.isEmpty()) {
            throw new IllegalStateException("LinkedIn OAuth credentials are not configured");
        }

        final MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", callbackRedirectUri);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

        final Map<String, Object> tokenResponse = oauthRestClient.post()
                .uri("/oauth/v2/accessToken")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (tokenResponse == null) {
            throw new IllegalStateException("LinkedIn OAuth token response is empty");
        }

        final Object accessToken = tokenResponse.get("access_token");
        if (!(accessToken instanceof String token) || token.isBlank()) {
            throw new IllegalStateException("LinkedIn OAuth token response did not include a valid access_token");
        }

        return token;
    }
}

