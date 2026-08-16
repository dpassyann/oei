package global.oei.infrastructure.mail;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;

import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.icegreen.greenmail.util.ServerSetupTest;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * End-to-end test of the order-confirmation email against an in-memory test SMTP server (never
 * a real SMTP send), verifying that the multipart {@code text/plain} + {@code text/html} MIME
 * message is genuinely well-formed — see
 * {@code .prompt/plan/store/03-emails-transactionnels.md §4} for why one representative
 * GreenMail test complements the mocked {@link JavaMailSenderImpl} unit tests.
 *
 * <p>{@code @Async} has no effect here (no Spring AOP proxy in this plain unit test): the send
 * happens synchronously on the calling thread, so no polling/await is needed before asserting
 * on {@link GreenMailExtension#getReceivedMessages()}.</p>
 */
class EmailNotificationAdapterGreenMailIT {

    @RegisterExtension
    static final GreenMailExtension GREEN_MAIL = new GreenMailExtension(ServerSetupTest.SMTP);

    private EmailNotificationAdapter adapter;

    @BeforeEach
    void setUp() {
        final JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("localhost");
        mailSender.setPort(GREEN_MAIL.getSmtp().getPort());

        final SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        final ClassLoaderTemplateResolver htmlResolver = new ClassLoaderTemplateResolver();
        htmlResolver.setPrefix("templates/");
        htmlResolver.setSuffix(".html");
        htmlResolver.setTemplateMode(TemplateMode.HTML);
        htmlResolver.setCharacterEncoding("UTF-8");
        htmlResolver.setOrder(1);
        templateEngine.addTemplateResolver(htmlResolver);
        templateEngine.addTemplateResolver(new EmailTemplateConfiguration().emailTextTemplateResolver());
        final var messageSource = new EmailTemplateConfiguration().messageSource();
        templateEngine.setTemplateEngineMessageSource(messageSource);

        adapter = new EmailNotificationAdapter(mailSender, templateEngine, messageSource);
        ReflectionTestUtils.setField(adapter, "fromAddress", "no-reply@theitorder.global");
        ReflectionTestUtils.setField(adapter, "publicBaseUrl", "https://theitorder.global");
    }

    @AfterEach
    void tearDown() {
        GREEN_MAIL.reset();
    }

    @Test
    void sendOrderConfirmation_deliversAWellFormedMultipartMessage() throws Exception {
        final Member member = new Member(new MemberId(UUID.randomUUID()), "jane-doe", "Jane Doe", "Jane Doe", "fr", "FR", AccountType.REAL, Instant.now());
        final OrderLine line = new OrderLine("line-1", "order-1", "prod-1", 1, BigDecimal.valueOf(9.90), null, null);
        final Order order = new Order(
                "order-1", member.id(), List.of(line), BigDecimal.valueOf(9.90), "EUR", OrderStatus.PENDING_FULFILLMENT, Instant.now(), Instant.now());

        adapter.sendOrderConfirmation(order, member);

        final MimeMessage[] receivedMessages = GREEN_MAIL.getReceivedMessages();
        assertThat(receivedMessages).hasSize(1);
        final MimeMessage received = receivedMessages[0];

        assertThat(received.getSubject()).isEqualTo("Confirmation de votre commande boutique OEI");
        assertThat(received.getContentType()).contains("multipart");
        final String body = GreenMailUtil.getBody(received);
        assertThat(body).contains("Jane Doe");
    }
}
