package global.oei.application.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import global.oei.application.web.adapter.MembershipAdapter;
import global.oei.application.web.resource.MembershipResource;
import global.oei.application.web.service.MembershipService;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Explicit {@code @Bean} wiring for this module's {@code *Resource}/{@code *Adapter}/
 * {@code service.*Service} classes — no classpath component scanning (see the
 * spring-boot-ddd-backend skill's "Explicit wiring" rule). Every bean below is constructed
 * by hand, injecting only {@code domain-shared} interfaces resolved from
 * {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}.
 */
@Configuration(proxyBeanMethods = false)
public class WebResourcesConfiguration {

    @Bean
    public MembershipAdapter membershipAdapter(
            final SecurityContextPort securityContextPort, final MembershipLookupPort membershipLookupPort) {
        return new MembershipService(securityContextPort, membershipLookupPort);
    }

    @Bean
    public MembershipResource membershipResource(final MembershipAdapter membershipAdapter) {
        return new MembershipResource(membershipAdapter);
    }
}
