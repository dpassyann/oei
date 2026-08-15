package global.oei.infrastructure.persistence.membershipfee;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
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
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied. Uses the real seeded demo member (Alice, 0004) as the payer.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class MembershipFeePaymentPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MembershipFeePaymentRepository repository;

    @Test
    void save_thenFindByMemberId_returnsTheRecordedPayment() {
        final MembershipFeePaymentPersistenceAdapter adapter = new MembershipFeePaymentPersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final MembershipFeePayment payment = new MembershipFeePayment(
                UUID.randomUUID().toString(), memberId, 2026, MembershipFeeTier.MEMBER, 50.0,
                MembershipFeePaymentStatus.PAID, Instant.now());

        adapter.save(payment);

        final List<MembershipFeePayment> byMember = adapter.findByMemberId(memberId);
        assertThat(byMember).extracting(MembershipFeePayment::id).contains(payment.id());
        assertThat(byMember).extracting(MembershipFeePayment::status).containsOnly(MembershipFeePaymentStatus.PAID);
    }
}
