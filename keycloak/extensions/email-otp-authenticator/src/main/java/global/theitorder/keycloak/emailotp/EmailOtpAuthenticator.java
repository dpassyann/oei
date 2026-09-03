package global.theitorder.keycloak.emailotp;

import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.Authenticator;
import org.keycloak.email.EmailException;
import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;
import org.jboss.logging.Logger;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Mandatory email one-time-password step for the OEI browser login flow.
 *
 * <p>On {@link #authenticate}, a numeric code is generated, stored as an
 * authentication-session note and sent to the user's verified email address
 * using Keycloak's own {@link EmailTemplateProvider} (so it goes through the
 * realm's configured SMTP/SES relay and renders with the "oei" email theme,
 * exactly like the existing verification/reset emails).</p>
 *
 * <p>On {@link #action}, the code submitted via the challenge form is checked
 * against the stored value, honouring an expiry window and a maximum number
 * of attempts, both configurable per-execution.</p>
 */
public class EmailOtpAuthenticator implements Authenticator {

    private static final Logger LOG = Logger.getLogger(EmailOtpAuthenticator.class);

    public static final String CODE_NOTE = "email_otp_code";
    public static final String CODE_TIMESTAMP_NOTE = "email_otp_ts";
    public static final String CODE_ATTEMPTS_NOTE = "email_otp_attempts";

    static final String FIELD_CODE = "emailOtpCode";
    static final String FIELD_RESEND = "resend";

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        UserModel user = context.getUser();
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            // No verified address to send the code to: fail closed rather than
            // silently letting the user through without the second factor.
            context.getEvent().error("email_otp_no_email");
            context.failureChallenge(AuthenticationFlowError.INVALID_USER,
                    context.form().setError("emailOtpNoEmailError").createErrorPage(Response.Status.BAD_REQUEST));
            return;
        }

        String code = generateAndSendCode(context, user);
        if (code == null) {
            // generateAndSendCode already reported the challenge on failure.
            return;
        }

        context.challenge(challengeForm(context, null));
    }

    @Override
    public void action(AuthenticationFlowContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();

        if (formData.containsKey(FIELD_RESEND)) {
            UserModel user = context.getUser();
            String code = generateAndSendCode(context, user);
            if (code != null) {
                context.challenge(challengeForm(context, "emailOtpResendSuccess"));
            }
            return;
        }

        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String expectedCode = authSession.getAuthNote(CODE_NOTE);
        String submittedCode = formData.getFirst(FIELD_CODE);

        if (expectedCode == null || isExpired(context, authSession)) {
            clearNotes(authSession);
            context.failureChallenge(AuthenticationFlowError.EXPIRED_CODE,
                    challengeForm(context, "emailOtpCodeExpired"));
            return;
        }

        int attempts = incrementAttempts(authSession);
        int maxAttempts = getMaxAttempts(context);
        if (attempts > maxAttempts) {
            clearNotes(authSession);
            context.failureChallenge(AuthenticationFlowError.EXPIRED_CODE,
                    challengeForm(context, "emailOtpTooManyAttempts"));
            return;
        }

        if (submittedCode == null || !submittedCode.trim().equals(expectedCode)) {
            context.failureChallenge(AuthenticationFlowError.INVALID_CREDENTIALS,
                    challengeForm(context, "emailOtpInvalidCode"));
            return;
        }

        clearNotes(authSession);
        context.success();
    }

    @Override
    public boolean requiresUser() {
        return true;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return user.getEmail() != null && !user.getEmail().isBlank();
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
        // Nothing to set up: the user's existing verified email address is reused,
        // there is no separate enrollment step (unlike CONFIGURE_TOTP).
    }

    @Override
    public void close() {
        // Stateless, nothing to release.
    }

    private Response challengeForm(AuthenticationFlowContext context, String errorMessageKey) {
        var form = context.form().setAttribute("email", maskEmail(context.getUser()));
        if (errorMessageKey != null) {
            form = form.setError(errorMessageKey);
        }
        return form.createForm("login-email-otp.ftl");
    }

    private String generateAndSendCode(AuthenticationFlowContext context, UserModel user) {
        String code = generateNumericCode(getCodeLength(context));
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        authSession.setAuthNote(CODE_NOTE, code);
        authSession.setAuthNote(CODE_TIMESTAMP_NOTE, Long.toString(System.currentTimeMillis()));
        authSession.setAuthNote(CODE_ATTEMPTS_NOTE, "0");

        try {
            sendEmail(context, user, code);
            return code;
        } catch (EmailException e) {
            LOG.error("Failed to send email OTP code", e);
            context.getEvent().error("email_otp_send_failed");
            context.failureChallenge(AuthenticationFlowError.INTERNAL_ERROR,
                    context.form().setError("emailOtpSendError").createErrorPage(Response.Status.INTERNAL_SERVER_ERROR));
            return null;
        }
    }

    private void sendEmail(AuthenticationFlowContext context, UserModel user, String code) throws EmailException {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        int ttlMinutes = getTtlMinutes(context);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("code", code);
        attributes.put("ttlMinutes", ttlMinutes);

        session.getProvider(EmailTemplateProvider.class)
                .setRealm(realm)
                .setUser(user)
                .setAuthenticationSession(context.getAuthenticationSession())
                .send("emailOtpSubject", Collections.emptyList(), "email-otp.ftl", attributes);
    }

    private boolean isExpired(AuthenticationFlowContext context, AuthenticationSessionModel authSession) {
        String tsNote = authSession.getAuthNote(CODE_TIMESTAMP_NOTE);
        if (tsNote == null) {
            return true;
        }
        long sentAt = Long.parseLong(tsNote);
        long ttlMillis = getTtlMinutes(context) * 60_000L;
        return System.currentTimeMillis() - sentAt > ttlMillis;
    }

    private int incrementAttempts(AuthenticationSessionModel authSession) {
        String attemptsNote = authSession.getAuthNote(CODE_ATTEMPTS_NOTE);
        int attempts = attemptsNote == null ? 0 : Integer.parseInt(attemptsNote) + 1;
        authSession.setAuthNote(CODE_ATTEMPTS_NOTE, Integer.toString(attempts));
        return attempts;
    }

    private void clearNotes(AuthenticationSessionModel authSession) {
        authSession.removeAuthNote(CODE_NOTE);
        authSession.removeAuthNote(CODE_TIMESTAMP_NOTE);
        authSession.removeAuthNote(CODE_ATTEMPTS_NOTE);
    }

    private int getCodeLength(AuthenticationFlowContext context) {
        return getIntConfig(context, EmailOtpAuthenticatorFactory.CONFIG_CODE_LENGTH,
                EmailOtpAuthenticatorFactory.DEFAULT_CODE_LENGTH);
    }

    private int getTtlMinutes(AuthenticationFlowContext context) {
        return getIntConfig(context, EmailOtpAuthenticatorFactory.CONFIG_TTL_MINUTES,
                EmailOtpAuthenticatorFactory.DEFAULT_TTL_MINUTES);
    }

    private int getMaxAttempts(AuthenticationFlowContext context) {
        return getIntConfig(context, EmailOtpAuthenticatorFactory.CONFIG_MAX_ATTEMPTS,
                EmailOtpAuthenticatorFactory.DEFAULT_MAX_ATTEMPTS);
    }

    private int getIntConfig(AuthenticationFlowContext context, String key, int defaultValue) {
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        if (config == null || config.getConfig() == null || config.getConfig().get(key) == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(config.getConfig().get(key));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static String generateNumericCode(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private static String maskEmail(UserModel user) {
        if (user == null || user.getEmail() == null) {
            return "";
        }
        String email = user.getEmail();
        int at = email.indexOf('@');
        if (at <= 1) {
            return email;
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
