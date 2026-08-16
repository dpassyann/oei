package global.oei.infrastructure.security.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.infrastructure.security.authentication.OeiJwtAuthenticationConverter;
import global.oei.infrastructure.security.context.SpringSecurityContextAdapter;
import global.oei.infrastructure.security.properties.OeiSecurityProperties;
import lombok.extern.slf4j.Slf4j;

/**
 * Auto-configures an OAuth2/JWT resource server pointed at the OEI Keycloak realm.
 *
 * <p>Two security filter chains are registered (unless overridden):</p>
 * <ol>
 *   <li><b>Public chain</b> (Order 1) — matches {@code oei.security.public-urls} patterns,
 *       requires no authentication and performs <em>no JWT validation</em>. This prevents
 *       Spring Security from returning 401 when the frontend sends an expired/invalid bearer
 *       token to a public endpoint (e.g. {@code /api/public/**}).</li>
 *   <li><b>Protected chain</b> (Order 2) — matches everything else, stateless OAuth2/JWT
 *       resource server, every request must carry a valid Keycloak bearer token.</li>
 * </ol>
 *
 * <p>The resource server issuer itself comes from the standard
 * {@code spring.security.oauth2.resourceserver.jwt.issuer-uri} property.</p>
 */
@Slf4j
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@EnableWebSecurity
@EnableConfigurationProperties(OeiSecurityProperties.class)
public class OeiSecurityAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public OeiJwtAuthenticationConverter oeiJwtAuthenticationConverter(final OeiSecurityProperties properties) {
        return new OeiJwtAuthenticationConverter(properties);
    }

    @Bean
    @ConditionalOnMissingBean
    public SecurityContextPort securityContextPort() {
        return new SpringSecurityContextAdapter();
    }

    /**
     * Public security chain (Order 1): matches the configured public URL patterns and allows
     * all requests without any JWT validation. Running before the protected chain (Order 2)
     * ensures that public paths are never handed to the JWT filter — an expired or invalid
     * bearer token sent by the frontend will NOT cause a 401 on these paths.
     */
    @Bean("oeiPublicSecurityFilterChain")
    @Order(1)
    @ConditionalOnMissingBean(name = "oeiPublicSecurityFilterChain")
    public SecurityFilterChain oeiPublicSecurityFilterChain(
            final HttpSecurity http,
            final OeiSecurityProperties properties) throws Exception {
        log.debug("Registering public security filter chain for patterns: {}", (Object) properties.getPublicUrls());
        http.securityMatcher(properties.getPublicUrls())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    /**
     * Protected security chain (Order 2): matches every request not claimed by the public
     * chain. Every request must carry a valid Keycloak bearer token.
     */
    @Bean("oeiProtectedSecurityFilterChain")
    @Order(2)
    @ConditionalOnMissingBean(name = "oeiProtectedSecurityFilterChain")
    public SecurityFilterChain oeiProtectedSecurityFilterChain(
            final HttpSecurity http,
            final OeiJwtAuthenticationConverter converter) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)));
        return http.build();
    }
}
