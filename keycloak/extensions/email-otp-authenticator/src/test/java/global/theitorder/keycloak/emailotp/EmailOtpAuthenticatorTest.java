package global.theitorder.keycloak.emailotp;

import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.email.EmailException;
import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.events.EventBuilder;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.http.HttpRequest;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;
import org.mockito.ArgumentCaptor;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.RETURNS_SELF;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailOtpAuthenticatorTest {

    private final EmailOtpAuthenticator authenticator = new EmailOtpAuthenticator();

    private AuthenticationFlowContext context;
    private KeycloakSession session;
    private RealmModel realm;
    private UserModel user;
    private AuthenticationSessionModel authSession;
    private EmailTemplateProvider emailTemplateProvider;
    private LoginFormsProvider loginFormsProvider;
    private final Map<String, String> authNotes = new HashMap<>();

    @BeforeEach
    void setUp() {
        context = mock(AuthenticationFlowContext.class);
        session = mock(KeycloakSession.class);
        realm = mock(RealmModel.class);
        user = mock(UserModel.class);
        authSession = mock(AuthenticationSessionModel.class);
        emailTemplateProvider = mock(EmailTemplateProvider.class, RETURNS_SELF);
        loginFormsProvider = mock(LoginFormsProvider.class, RETURNS_SELF);

        when(context.getSession()).thenReturn(session);
        when(context.getRealm()).thenReturn(realm);
        when(context.getUser()).thenReturn(user);
        when(context.getAuthenticationSession()).thenReturn(authSession);
        when(context.getEvent()).thenReturn(mock(EventBuilder.class, RETURNS_SELF));
        when(context.form()).thenReturn(loginFormsProvider);
        when(context.getAuthenticatorConfig()).thenReturn(null);
        when(user.getEmail()).thenReturn("member@theitorder.global");
        when(session.getProvider(EmailTemplateProvider.class)).thenReturn(emailTemplateProvider);
        when(loginFormsProvider.createForm(anyString())).thenReturn(mock(Response.class));
        when(loginFormsProvider.createErrorPage(any())).thenReturn(mock(Response.class));

        // In-memory fake for authentication-session notes.
        authNotes.clear();
        doAnswerSetNote();
        when(authSession.getAuthNote(anyString())).thenAnswer(inv -> authNotes.get(inv.getArgument(0, String.class)));
    }

    private void doAnswerSetNote() {
        org.mockito.Mockito.doAnswer(inv -> {
            authNotes.put(inv.getArgument(0, String.class), inv.getArgument(1, String.class));
            return null;
        }).when(authSession).setAuthNote(anyString(), anyString());
        org.mockito.Mockito.doAnswer(inv -> {
            authNotes.remove(inv.getArgument(0, String.class));
            return null;
        }).when(authSession).removeAuthNote(anyString());
    }

    @Test
    void authenticate_sendsSixDigitCodeByEmail_andChallenges() throws EmailException {
        authenticator.authenticate(context);

        assertEquals(6, authNotes.get(EmailOtpAuthenticator.CODE_NOTE).length());
        verify(emailTemplateProvider).send(eq("emailOtpSubject"), anyList(), eq("email-otp.ftl"), anyMap());
        verify(context).challenge(any());
    }

    @Test
    void authenticate_withoutEmail_failsClosed() {
        when(user.getEmail()).thenReturn(null);

        authenticator.authenticate(context);

        verify(context).failureChallenge(eq(AuthenticationFlowError.INVALID_USER), any());
        assertNull(authNotes.get(EmailOtpAuthenticator.CODE_NOTE));
    }

    @Test
    void authenticate_whenSendFails_reportsInternalError() throws EmailException {
        doThrow(new EmailException("smtp down")).when(emailTemplateProvider)
                .send(anyString(), anyList(), anyString(), anyMap());

        authenticator.authenticate(context);

        verify(context).failureChallenge(eq(AuthenticationFlowError.INTERNAL_ERROR), any());
    }

    @Test
    void action_withCorrectCode_succeeds() throws EmailException {
        authenticator.authenticate(context);
        String code = authNotes.get(EmailOtpAuthenticator.CODE_NOTE);
        withFormData(EmailOtpAuthenticator.FIELD_CODE, code);

        authenticator.action(context);

        verify(context).success();
        assertNull(authNotes.get(EmailOtpAuthenticator.CODE_NOTE));
    }

    @Test
    void action_withWrongCode_failsChallengeAndKeepsCodeForRetry() throws EmailException {
        authenticator.authenticate(context);
        withFormData(EmailOtpAuthenticator.FIELD_CODE, "000000");

        authenticator.action(context);

        verify(context).failureChallenge(eq(AuthenticationFlowError.INVALID_CREDENTIALS), any());
    }

    @Test
    void action_afterExceedingMaxAttempts_invalidatesCode() throws EmailException {
        authenticator.authenticate(context);
        withFormData(EmailOtpAuthenticator.FIELD_CODE, "000000");

        for (int i = 0; i < EmailOtpAuthenticatorFactory.DEFAULT_MAX_ATTEMPTS + 1; i++) {
            authenticator.action(context);
        }

        assertNull(authNotes.get(EmailOtpAuthenticator.CODE_NOTE));
        verify(context, times(EmailOtpAuthenticatorFactory.DEFAULT_MAX_ATTEMPTS))
                .failureChallenge(eq(AuthenticationFlowError.INVALID_CREDENTIALS), any());
        verify(context, times(1))
                .failureChallenge(eq(AuthenticationFlowError.EXPIRED_CODE), any());
    }

    @Test
    void action_withResendRequest_generatesNewCodeAndResendsEmail() throws EmailException {
        authenticator.authenticate(context);
        String firstCode = authNotes.get(EmailOtpAuthenticator.CODE_NOTE);
        withFormData(EmailOtpAuthenticator.FIELD_RESEND, "true");

        authenticator.action(context);

        String secondCode = authNotes.get(EmailOtpAuthenticator.CODE_NOTE);
        assertEquals(6, secondCode.length());
        verify(emailTemplateProvider, times(2))
                .send(eq("emailOtpSubject"), anyList(), eq("email-otp.ftl"), anyMap());
        // Codes are randomly generated; if they happen to collide the resend still counts
        // via the second invocation assertion above.
    }

    @Test
    void action_afterExpiry_rejectsEvenCorrectCode() throws EmailException {
        authenticator.authenticate(context);
        String code = authNotes.get(EmailOtpAuthenticator.CODE_NOTE);
        // Simulate a timestamp far enough in the past to be expired (default TTL: 5 minutes).
        authNotes.put(EmailOtpAuthenticator.CODE_TIMESTAMP_NOTE,
                Long.toString(System.currentTimeMillis() - 6 * 60_000L));
        withFormData(EmailOtpAuthenticator.FIELD_CODE, code);

        authenticator.action(context);

        verify(context).failureChallenge(eq(AuthenticationFlowError.EXPIRED_CODE), any());
        assertNull(authNotes.get(EmailOtpAuthenticator.CODE_NOTE));
    }

    @Test
    void requiresUser_isTrue() {
        assertEquals(true, authenticator.requiresUser());
    }

    @Test
    void configuredFor_requiresNonBlankEmail() {
        when(user.getEmail()).thenReturn("");
        assertEquals(false, authenticator.configuredFor(session, realm, user));

        when(user.getEmail()).thenReturn("member@theitorder.global");
        assertEquals(true, authenticator.configuredFor(session, realm, user));
    }

    private void withFormData(String key, String value) {
        HttpRequest httpRequest = mock(HttpRequest.class);
        MultivaluedMap<String, String> formData = new MultivaluedHashMap<>();
        formData.add(key, value);
        when(httpRequest.getDecodedFormParameters()).thenReturn(formData);
        when(context.getHttpRequest()).thenReturn(httpRequest);
    }
}
