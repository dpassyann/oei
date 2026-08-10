package org.oei.infrastructure.security.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import org.oei.domain.shared.security.SecurityContextPort;
import org.oei.infrastructure.security.authentication.OeiJwtAuthenticationConverter;
import org.oei.infrastructure.security.context.SpringSecurityContextAdapter;
import org.oei.infrastructure.security.properties.OeiSecurityProperties;

/**
 * Auto-configures an OAuth2/JWT resource server pointed at the OEI Keycloak realm.
 *
 * <p>Registers, unless the consuming application already provides its own bean of the same
 * type ({@code @ConditionalOnMissingBean}):</p>
 * <ul>
 *   <li>{@link OeiJwtAuthenticationConverter} — maps {@code realm_access.roles} to
 *       {@code ROLE_*} authorities;</li>
 *   <li>a default {@link SecurityFilterChain} — stateless resource server, only
 *       {@code oei.security.public-urls} are permitted anonymously, everything else
 *       requires a valid bearer token;</li>
 *   <li>{@link SpringSecurityContextAdapter} — the {@link SecurityContextPort}
 *       implementation consumed by {@code domain-core} use cases.</li>
 * </ul>
 *
 * <p>The resource server issuer itself comes from the standard
 * {@code spring.security.oauth2.resourceserver.jwt.issuer-uri} property, so this
 * auto-configuration relies on Spring Boot's own OAuth2 resource server auto-configuration
 * for JWT decoding/validation and only customizes role mapping and URL rules.</p>
 */
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

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain oeiSecurityFilterChain(
            final HttpSecurity http,
            final OeiSecurityProperties properties,
            final OeiJwtAuthenticationConverter converter)
            throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(properties.getPublicUrls())
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)));
        return http.build();
    }
}
