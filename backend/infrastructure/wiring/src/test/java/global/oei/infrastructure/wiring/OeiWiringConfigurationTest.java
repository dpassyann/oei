package global.oei.infrastructure.wiring;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.event.EventPort;
import global.oei.domain.shared.institution.InstitutionPort;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.security.GetMyIdentityUseCase;
import global.oei.domain.shared.wallet.WalletPassPort;

/**
 * Boots the real composition root ({@link OeiWiringConfiguration}) against a real Postgres
 * (never H2 — Testcontainers), with the actual Liquibase changelog applied, and asserts
 * every bean the class is meant to produce is actually reachable from the context — a
 * catch-all regression test for wiring mistakes (missing bean, wrong constructor argument
 * order, a port left unbound, ...) across every bounded context, given how large this class
 * has grown.
 */
@Testcontainers
@SpringBootTest(
        classes = OeiWiringConfigurationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class OeiWiringConfigurationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoadsWithEveryBoundedContextWired() {
        assertThat(context.getBean(GetMyIdentityUseCase.class)).isNotNull();
        assertThat(context.getBean(MembershipLookupPort.class)).isNotNull();
        assertThat(context.getBean(CertificationPort.class)).isNotNull();
        assertThat(context.getBean(WalletPassPort.class)).isNotNull();
        assertThat(context.getBean(CvPort.class)).isNotNull();
        assertThat(context.getBean(InstitutionPort.class)).isNotNull();
        assertThat(context.getBean(ContentPort.class)).isNotNull();
        assertThat(context.getBean(EventPort.class)).isNotNull();
    }
}
