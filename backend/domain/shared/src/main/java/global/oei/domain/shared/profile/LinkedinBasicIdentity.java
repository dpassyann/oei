package global.oei.domain.shared.profile;

/**
 * Identity attributes imported from LinkedIn OpenID user info for onboarding bootstrap.
 */
public record LinkedinBasicIdentity(
        String displayName,
        String legalName,
        String locale,
        String country) {
}

