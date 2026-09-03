package global.theitorder.keycloak.emailotp;

import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.provider.ProviderConfigurationBuilder;

import java.util.List;

/**
 * Factory for {@link EmailOtpAuthenticator}, registered via
 * {@code META-INF/services/org.keycloak.authentication.AuthenticatorFactory}.
 */
public class EmailOtpAuthenticatorFactory implements AuthenticatorFactory {

    public static final String PROVIDER_ID = "oei-email-otp-authenticator";

    public static final String CONFIG_CODE_LENGTH = "codeLength";
    public static final String CONFIG_TTL_MINUTES = "ttlMinutes";
    public static final String CONFIG_MAX_ATTEMPTS = "maxAttempts";

    public static final int DEFAULT_CODE_LENGTH = 6;
    public static final int DEFAULT_TTL_MINUTES = 5;
    public static final int DEFAULT_MAX_ATTEMPTS = 5;

    private static final EmailOtpAuthenticator SINGLETON = new EmailOtpAuthenticator();

    private static final AuthenticationExecutionModel.Requirement[] REQUIREMENT_CHOICES = {
            AuthenticationExecutionModel.Requirement.REQUIRED,
            AuthenticationExecutionModel.Requirement.DISABLED
    };

    @Override
    public String getId() {
        return PROVIDER_ID;
    }

    @Override
    public String getDisplayType() {
        return "OEI Email OTP";
    }

    @Override
    public String getReferenceCategory() {
        return "otp";
    }

    @Override
    public boolean isConfigurable() {
        return true;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return REQUIREMENT_CHOICES;
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public String getHelpText() {
        return "Sends a one-time numeric code to the user's verified email address "
                + "(via the realm's configured SMTP relay and the \"oei\" email theme) "
                + "and requires it to complete login.";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return ProviderConfigurationBuilder.create()
                .property()
                    .name(CONFIG_CODE_LENGTH)
                    .label("Code length")
                    .helpText("Number of digits in the generated one-time code.")
                    .type(ProviderConfigProperty.STRING_TYPE)
                    .defaultValue(String.valueOf(DEFAULT_CODE_LENGTH))
                    .add()
                .property()
                    .name(CONFIG_TTL_MINUTES)
                    .label("Code validity (minutes)")
                    .helpText("How long the code stays valid after being sent.")
                    .type(ProviderConfigProperty.STRING_TYPE)
                    .defaultValue(String.valueOf(DEFAULT_TTL_MINUTES))
                    .add()
                .property()
                    .name(CONFIG_MAX_ATTEMPTS)
                    .label("Max attempts")
                    .helpText("Number of incorrect attempts allowed before the code is invalidated.")
                    .type(ProviderConfigProperty.STRING_TYPE)
                    .defaultValue(String.valueOf(DEFAULT_MAX_ATTEMPTS))
                    .add()
                .build();
    }

    @Override
    public Authenticator create(KeycloakSession session) {
        return SINGLETON;
    }

    @Override
    public void init(Config.Scope config) {
        // No global configuration needed.
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        // No post-init hooks needed.
    }

    @Override
    public void close() {
        // Nothing to release.
    }
}
