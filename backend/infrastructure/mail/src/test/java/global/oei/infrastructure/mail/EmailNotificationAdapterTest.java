package global.oei.infrastructure.mail;

import static org.assertj.core.api.Assertions.assertThat;
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
import java.util.Locale;
import java.util.Properties;
import java.util.UUID;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderStatus;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * Never sends a real email: {@link JavaMailSender} is fully mocked here — only verifies that a
 * {@link MimeMessage} is built and handed to {@code send(...)} for each use case, that a
 * mail-sending failure never propagates back to the caller (see {@code EmailNotificationPort}'s
 * Javadoc), and that the same template genuinely renders different text for different member
 * locales (see {@code EmailNotificationAdapter}'s locale-driven i18n Javadoc).
 */
class EmailNotificationAdapterTest {

    private JavaMailSender mailSender;
    private SpringTemplateEngine templateEngine;
    private MessageSource messageSource;
    private EmailNotificationAdapter adapter;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        final Session session = Session.getDefaultInstance(new Properties());
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(session));

        templateEngine = new SpringTemplateEngine();
        final ClassLoaderTemplateResolver htmlResolver = new ClassLoaderTemplateResolver();
        htmlResolver.setPrefix("templates/");
        htmlResolver.setSuffix(".html");
        htmlResolver.setTemplateMode(TemplateMode.HTML);
        htmlResolver.setCharacterEncoding("UTF-8");
        htmlResolver.setOrder(1);
        templateEngine.addTemplateResolver(htmlResolver);
        templateEngine.addTemplateResolver(new EmailTemplateConfiguration().emailTextTemplateResolver());
        messageSource = new EmailTemplateConfiguration().messageSource();
        templateEngine.setTemplateEngineMessageSource(messageSource);

        adapter = new EmailNotificationAdapter(mailSender, templateEngine, messageSource);
        ReflectionTestUtils.setField(adapter, "fromAddress", "no-reply@theitorder.global");
        ReflectionTestUtils.setField(adapter, "publicBaseUrl", "https://theitorder.global");
    }

    private Member member() {
        return member("fr");
    }

    private Member member(final String locale) {
        return new Member(new MemberId(UUID.randomUUID()), "jane-doe", "Jane Doe", "Jane Doe", locale, "FR", AccountType.REAL, Instant.now());
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
    void sendMembershipDunningNotice_sendsAMimeMessage() {
        final Member member = member();

        adapter.sendMembershipDunningNotice(member, MembershipStatus.EXPIRED);

        verify(mailSender, timeout(2000)).send(any(MimeMessage.class));
    }

    @Test
    void sendMembershipRenewalReminder_sendsAMimeMessage() {
        final Member member = member();

        adapter.sendMembershipRenewalReminder(member, 2026);

        verify(mailSender, timeout(2000)).send(any(MimeMessage.class));
    }

    @Test
    void send_neverPropagatesAMailSendingFailure() {
        final Member member = member();
        doThrow(new MailSendException("boom")).when(mailSender).send(any(MimeMessage.class));

        assertThatCode(() -> adapter.sendOrderConfirmation(order(member.id()), member)).doesNotThrowAnyException();
    }

    @Test
    void sameTemplate_rendersDifferentTextForDifferentMemberLocales() {
        final Member frenchMember = member("fr");
        final Member englishMember = member("en");
        final Order order = order(frenchMember.id());

        final Context frenchContext = new Context(Locale.forLanguageTag("fr"));
        frenchContext.setVariable("member", frenchMember);
        frenchContext.setVariable("order", order);
        frenchContext.setVariable("publicBaseUrl", "https://theitorder.global");
        final String frenchHtml = templateEngine.process("email/order-confirmation", frenchContext);

        final Context englishContext = new Context(Locale.forLanguageTag("en"));
        englishContext.setVariable("member", englishMember);
        englishContext.setVariable("order", order);
        englishContext.setVariable("publicBaseUrl", "https://theitorder.global");
        final String englishHtml = templateEngine.process("email/order-confirmation", englishContext);

        assertThat(frenchHtml).contains("Bonjour").doesNotContain("Hello");
        assertThat(englishHtml).contains("Hello").doesNotContain("Bonjour");
        assertThat(frenchHtml).isNotEqualTo(englishHtml);
    }
}
