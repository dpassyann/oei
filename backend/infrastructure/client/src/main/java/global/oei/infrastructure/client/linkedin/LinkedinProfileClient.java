package global.oei.infrastructure.client.linkedin;

import java.util.Objects;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.profile.LinkedinBasicIdentity;
import global.oei.domain.shared.profile.LinkedinIdentityPort;
import global.oei.infrastructure.client.linkedin.generated.api.UserInfoApi;
import global.oei.infrastructure.client.linkedin.generated.model.LinkedinUserInfoDto;

/**
 * Dedicated LinkedIn client adapter used by backend workflows that need identity bootstrap.
 *
 * <p>Plain class (not a component): wired explicitly from infrastructure configuration, same
 * pattern as Stripe/PayPal adapters.</p>
 */
@RequiredArgsConstructor
public class LinkedinProfileClient implements LinkedinIdentityPort {

    private final UserInfoApi userInfoApi;

    @Override
    public LinkedinBasicIdentity fetchBasicIdentity(final String accessToken) {
        final String token = Objects.requireNonNull(accessToken, "accessToken must not be null").trim();
        if (token.isEmpty()) {
            throw new IllegalArgumentException("accessToken must not be blank");
        }
        final LinkedinUserInfoDto profile = userInfoApi.getLinkedinUserInfo("Bearer " + token).getBody();
        if (profile == null) {
            throw new IllegalStateException("LinkedIn user info response body is empty");
        }
        final String displayName = firstNonBlank(profile.getName(), profile.getGivenName(), "Membre OEI");
        final String legalName = firstNonBlank(profile.getName(), displayName);
        final String locale = firstNonBlank(profile.getLocale(), "fr-FR");
        return new LinkedinBasicIdentity(displayName, legalName, locale, locale);
    }

    private static String firstNonBlank(final String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}

