package global.oei.infrastructure.client.linkedin;

/**
 * Minimal LinkedIn identity payload used by OEI smart-onboarding.
 *
 * <p>This maps LinkedIn OpenID userinfo fields only (identity bootstrap) and deliberately
 * avoids professional-history enrichment, which is outside this V1 client scope.</p>
 */
public record LinkedinBasicProfile(
        String sub,
        String name,
        String givenName,
        String familyName,
        String picture,
        String locale,
        String email,
        Boolean emailVerified) {
}

