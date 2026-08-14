package global.oei.domain.shared.security;

import java.util.Objects;
import java.util.Set;

/**
 * The identity of the caller currently authenticated against the OEI Keycloak realm,
 * as seen by the domain — i.e. stripped of any Spring Security / JWT type.
 *
 * @param subject       stable Keycloak subject identifier ({@code sub} claim)
 * @param email         email claim, may be {@code null} depending on the identity provider flow
 * @param displayName   display name claim ({@code name}), may be {@code null}
 * @param roles         raw realm roles as read from {@code realm_access.roles}
 *                      (e.g. {@code member}, {@code admin}, {@code member-gold},
 *                      {@code institution-owner}) — already human-readable strings,
 *                      no further decoding needed by callers
 * @param institutionId the {@code institutionId} custom claim resolved from the caller's
 *                      {@code /institutions/{institutionId}} Keycloak group (ADR 0002,
 *                      Décision 2) — {@code null} unless the caller carries an
 *                      {@code institution-*} role
 */
public record AuthenticatedIdentity(
        String subject, String email, String displayName, Set<String> roles, String institutionId) {

    public AuthenticatedIdentity {
        Objects.requireNonNull(subject, "subject must not be null");
        if (subject.isBlank()) {
            throw new IllegalArgumentException("subject must not be blank");
        }
        roles = roles == null ? Set.of() : Set.copyOf(roles);
    }

    /**
     * Whether the caller carries the given raw realm role.
     */
    public boolean hasRole(final String role) {
        return roles.contains(role);
    }
}
