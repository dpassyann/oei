package global.oei.domain.shared.profile;

/**
 * Outbound port for retrieving LinkedIn basic identity from an OAuth access token.
 */
public interface LinkedinIdentityPort {

    LinkedinBasicIdentity fetchBasicIdentity(String accessToken);
}

