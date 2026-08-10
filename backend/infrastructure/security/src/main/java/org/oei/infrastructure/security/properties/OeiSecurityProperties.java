package org.oei.infrastructure.security.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the OEI security starter. The OAuth2 resource server issuer itself
 * is configured through the standard {@code spring.security.oauth2.resourceserver.jwt.issuer-uri}
 * property (see {@code application.yml} in {@code application-runtime}), not here.
 */
@ConfigurationProperties(prefix = "oei.security")
public class OeiSecurityProperties {

    /**
     * JWT claim holding the realm roles, following Keycloak's default token layout:
     * {@code realm_access.roles} (a nested claim, dot-separated here).
     */
    private String rolesClaim = "realm_access.roles";

    /**
     * Ant-style URL patterns that require no authentication at all.
     */
    private String[] publicUrls = new String[] {
        "/actuator/health", "/actuator/health/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"
    };

    public String getRolesClaim() {
        return rolesClaim;
    }

    public void setRolesClaim(final String rolesClaim) {
        this.rolesClaim = rolesClaim;
    }

    public String[] getPublicUrls() {
        return publicUrls;
    }

    public void setPublicUrls(final String[] publicUrls) {
        this.publicUrls = publicUrls;
    }
}
