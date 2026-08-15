package global.oei.infrastructure.persistence.wallet;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassStatus;
import global.oei.domain.shared.wallet.WalletPassVerification;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;
import global.oei.infrastructure.persistence.member.MemberRepository;
import global.oei.infrastructure.persistence.membership.MembershipRepository;

/**
 * Integration test against a real Postgres (Testcontainers, never H2): asserts
 * {@code verifyBySerialNumber}'s cross-table join (member's public slug + membership tier)
 * against a real demo member/membership row.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class WalletPassPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private WalletPassRepository repository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Test
    void verifyBySerialNumber_resolvesMemberSlugAndMembershipTier() {
        final WalletPassPersistenceAdapter adapter = new WalletPassPersistenceAdapter(repository, memberRepository, membershipRepository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final WalletPass pass = new WalletPass(
                UUID.randomUUID().toString(), memberId, WalletPassProvider.APPLE, WalletPassStatus.MOCKED, "MOCK-serial-it", null,
                null, Instant.now(), null, true);
        adapter.save(pass);

        final WalletPassVerification verification = adapter.verifyBySerialNumber("MOCK-serial-it").orElseThrow();

        assertThat(verification.valid()).isTrue();
        assertThat(verification.memberPublicSlug()).isEqualTo("demo-alice-nguyen-0");
        assertThat(verification.tier()).isEqualTo(MembershipTier.STANDARD);
    }
}
