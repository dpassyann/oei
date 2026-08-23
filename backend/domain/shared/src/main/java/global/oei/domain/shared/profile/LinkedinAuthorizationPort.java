package global.oei.domain.shared.profile;

/**
 * Exchanges a LinkedIn OAuth authorization code for a bearer access token.
 */
public interface LinkedinAuthorizationPort {

    String exchangeAuthorizationCode(String authorizationCode, String redirectUri);
}

