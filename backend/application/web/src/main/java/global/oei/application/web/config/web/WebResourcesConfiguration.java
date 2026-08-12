package global.oei.application.web.config.web;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import global.oei.application.web.resource.member.MembershipResource;
import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.application.web.resource.member.service.MembershipService;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Explicit {@code @Bean} wiring for this module's {@code resource.<domain>} packages
 * ({@code *Resource}/{@code *Adapter}/{@code service.*Service}) — no classpath component
 * scanning (see the spring-boot-ddd-backend skill's "Explicit wiring" rule). Every bean
 * below is constructed by hand, injecting only {@code domain-shared} interfaces resolved
 * from {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}.
 *
 * <p>Lives under {@code config.web} (technical concern: MVC/resource wiring), one of this
 * module's config subpackages by concern (domain-first packaging — see the
 * spring-boot-ddd-backend skill's "Domain-first packaging" rule).</p>
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
