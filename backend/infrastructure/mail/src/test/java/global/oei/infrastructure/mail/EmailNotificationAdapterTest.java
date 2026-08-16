package global.oei.infrastructure.mail;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderStatus;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * Never sends a real email: {@link JavaMailSender} is fully mocked here — only verifies that a
 * {@link MimeMessage} is built and handed to {@code send(...)} for each use case, and that a
 * mail-sending failure never propagates back to the caller (see {@code EmailNotificationPort}'s
 * Javadoc).
 */
class EmailNotificationAdapterTest {

    private JavaMailSender mailSender;
    private EmailNotificationAdapter adapter;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        final Session session = Session.getDefaultInstance(new Properties());
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(session));

        final SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        final ClassLoaderTemplateResolver htmlResolver = new ClassLoaderTemplateResolver();
        htmlResolver.setPrefix("templates/");
        htmlResolver.setSuffix(".html");
        htmlResolver.setTemplateMode(TemplateMode.HTML);
        htmlResolver.setCharacterEncoding("UTF-8");
        htmlResolver.setOrder(1);
        templateEngine.addTemplateResolver(htmlResolver);
        templateEngine.addTemplateResolver(new EmailTemplateConfiguration().emailTextTemplateResolver());

        adapter = new EmailNotificationAdapter(mailSender, templateEngine);
        ReflectionTestUtils.setField(adapter, "fromAddress", "no-reply@oei.global");
    }

    private Member member() {
        return new Member(new MemberId(UUID.randomUUID()), "jane-doe", "Jane Doe", "Jane Doe", "fr", "FR", AccountType.REAL, Instant.now());
    }

    private Order order(final MemberId memberId) {
        final OrderLine line = new OrderLine("line-1", "order-1", "prod-1", 1, BigDecimal.valueOf(9.90), null, null);
        return new Order(
                "order-1", memberId, List.of(line), BigDecimal.valueOf(9.90), "EUR", OrderStatus.PENDING_FULFILLMENT, Instant.now(), Instant.now());
    }

    @Test
    void sendOrderConfirmation_sendsAMimeMessage() {
        final Member member = member();

        adapter.sendOrderConfirmation(order(member.id()), member);

        verify(mailSender, timeout(2000)).send(any(MimeMessage.class));
    }

    @Test
    void sendMembershipFeePaymentConfirmation_sendsAMimeMessage() {
        final Member member = member();
        final MembershipFeePayment payment = new MembershipFeePayment(
                "payment-1", member.id(), 2026, MembershipFeeTier.MEMBER, 50.0, MembershipFeePaymentStatus.PAID, Instant.now());

        adapter.sendMembershipFeePaymentConfirmation(payment, member);

        verify(mailSender, timeout(2000)).send(any(MimeMessage.class));
    }

    @Test
    void sendContributionAcknowledgement_sendsAMimeMessage() {
        final Member member = member();
        final ContentContribution contribution = new ContentContribution(
                "contribution-1", "content-1", "patch", member.id(), ContentContributionStatus.PROPOSED, Instant.now());

        adapter.sendContributionAcknowledgement(contribution, member);

        verify(mailSender, timeout(2000)).send(any(MimeMessage.class));
    }

    @Test
    void send_neverPropagatesAMailSendingFailure() {
        final Member member = member();
        doThrow(new MailSendException("boom")).when(mailSender).send(any(MimeMessage.class));

        assertThatCode(() -> adapter.sendOrderConfirmation(order(member.id()), member)).doesNotThrowAnyException();
    }
}
