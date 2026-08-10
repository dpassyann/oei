package global.oei.domain.shared.membership;

/**
 * Membership levels ("tiers"), mirrored one-to-one on the OEI OpenAPI contract
 * ({@code MembershipTier} schema) and on the Keycloak realm role naming convention
 * {@code member-<tier-kebab-case>} (see {@code docs/architecture/keycloak-roles.md}).
 *
 * <p>Do not reorder/rename these constants without updating both the OpenAPI contract
 * and the Keycloak realm roles in lockstep — see ADR 0002.</p>
 */
public enum MembershipTier {
    STANDARD,
    SILVER,
    GOLD,
    FOUNDING,
    HONORARY,
    INSTITUTIONAL_AFFILIATE
}
