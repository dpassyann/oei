package global.oei.infrastructure.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.mail.EmailNotificationPort;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.store.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

/**
 * Sends business-reassurance transactional emails via Spring Mail (Amazon SES over SMTP in
 * production, see {@code application.yml}'s {@code spring.mail.*} properties) and Thymeleaf
 * HTML+text templates.
 *
 * <p><b>Known V1 simplification (documented, not silently worked around):</b> {@link Member}
 * does not carry a persisted email address in this codebase — Keycloak is the source of
 * truth for it and this backend never duplicates it (see
 * {@code .prompt/plan/store/03-emails-transactionnels.md §0}). Until {@code Member} (or a
 * lookup against Keycloak) exposes a genuine address, this adapter resolves the recipient as
 * {@code <publicSlug>@members.oei.local}, a clearly non-routable placeholder — this must be
 * replaced before any production email is genuinely delivered. This does not affect
 * correctness of the template/dispatch mechanism itself, which is fully real.</p>
 *
 * <p>Every send is {@code @Async} (see {@link EmailAsyncConfiguration}): a failure/timeout is
 * logged at {@code WARN} and never rethrown to the caller, so the triggering business
 * transaction (payment, order, contribution) is never rolled back because of it.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class EmailNotificationAdapter implements EmailNotificationPort {

    private static final String PLACEHOLDER_EMAIL_DOMAIN = "@members.oei.local";

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${oei.mail.from:no-reply@oei.global}")
    private String fromAddress;

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendMembershipFeePaymentConfirmation(final MembershipFeePayment payment, final Member member) {
        final Context context = new Context();
        context.setVariable("member", member);
        context.setVariable("payment", payment);
        send(member, "Confirmation de votre cotisation OEI", "membership-fee-payment-confirmation", context);
    }

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendOrderConfirmation(final Order order, final Member member) {
        final Context context = new Context();
        context.setVariable("member", member);
        context.setVariable("order", order);
        send(member, "Confirmation de votre commande boutique OEI", "order-confirmation", context);
    }

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendContributionAcknowledgement(final ContentContribution contribution, final Member member) {
        final Context context = new Context();
        context.setVariable("member", member);
        context.setVariable("contribution", contribution);
        send(member, "Votre contribution a bien été reçue", "contribution-acknowledgement", context);
    }

    private void send(final Member member, final String subject, final String templateName, final Context context) {
        try {
            final String html = templateEngine.process("email/" + templateName, context);
            final String text = templateEngine.process("email/" + templateName + "-text", context);

            final MimeMessage mimeMessage = mailSender.createMimeMessage();
            final MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(recipientAddress(member));
            helper.setSubject(subject);
            helper.setText(text, html);

            mailSender.send(mimeMessage);
        } catch (final MailException | MessagingException e) {
            log.warn("Failed to send email '{}' to member {}: {}", templateName, member.id(), e.getMessage());
        }
    }

    private String recipientAddress(final Member member) {
        return member.publicSlug() + PLACEHOLDER_EMAIL_DOMAIN;
    }
}
