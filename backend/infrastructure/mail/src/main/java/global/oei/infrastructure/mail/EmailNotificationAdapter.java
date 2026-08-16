package global.oei.infrastructure.mail;

import java.util.Locale;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.mail.EmailNotificationPort;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.store.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

/**
 * Sends business-reassurance transactional emails via Spring Mail (Amazon SES over SMTP in
 * production, see {@code application.yml}'s {@code spring.mail.*} properties) and Thymeleaf
 * HTML+text templates, each resolved in the recipient {@link Member}'s own
 * {@link Member#locale()} (never a fixed locale) against {@code email/messages*.properties}
 * (French is the ultimate fallback, consistent with the site's default language).
 *
 * <p><b>Known V1 simplification (documented, not silently worked around):</b> {@link Member}
 * does not carry a persisted email address in this codebase — Keycloak is the source of
 * truth for it and this backend never duplicates it (see
 * {@code .prompt/plan/store/03-emails-transactionnels.md §0}). Until {@code Member} (or a
 * lookup against Keycloak) exposes a genuine address, this adapter resolves the recipient as
 * {@code <publicSlug>@members.oei.local}, a clearly non-routable placeholder — this must be
 * replaced before any production email is genuinely delivered. This does not affect
 * correctness of the template/dispatch/i18n mechanism itself, which is fully real.</p>
 *
 * <p>Every send is {@code @Async} (see {@link EmailAsyncConfiguration}): a failure/timeout is
 * logged at {@code WARN} and never rethrown to the caller, so the triggering business
 * transaction (payment, order, contribution) is never rolled back because of it.</p>
 *
 * <p>{@link #sendMembershipDunningNotice(Member, MembershipStatus)}/
 * {@link #sendMembershipRenewalReminder(Member, int)} are only the send operations — no
 * {@code @Scheduled} job triggers them automatically from a membership-status transition or
 * an upcoming cycle deadline in this codebase yet; wiring that trigger is a follow-up TODO.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class EmailNotificationAdapter implements EmailNotificationPort {

    private static final String PLACEHOLDER_EMAIL_DOMAIN = "@members.oei.local";
    private static final Locale DEFAULT_LOCALE = Locale.FRENCH;

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final MessageSource messageSource;

    @Value("${oei.mail.from:no-reply@theitorder.global}")
    private String fromAddress;

    /**
     * Public site base URL (e.g. {@code https://theitorder.global}), used to build every
     * absolute link in a template (header/footer nav, CTA buttons) — never hardcoded per
     * template, so a domain change is a one-property fix. See {@code application.yml}'s
     * {@code oei.public-base-url}.
     */
    @Value("${oei.public-base-url:https://theitorder.global}")
    private String publicBaseUrl;

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendMembershipFeePaymentConfirmation(final MembershipFeePayment payment, final Member member) {
        final Locale locale = memberLocale(member);
        final Context context = newContext(locale);
        context.setVariable("member", member);
        context.setVariable("payment", payment);
        send(member, locale, "email.membership-fee-payment-confirmation.subject", "membership-fee-payment-confirmation", context);
    }

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendOrderConfirmation(final Order order, final Member member) {
        final Locale locale = memberLocale(member);
        final Context context = newContext(locale);
        context.setVariable("member", member);
        context.setVariable("order", order);
        send(member, locale, "email.order-confirmation.subject", "order-confirmation", context);
    }

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendContributionAcknowledgement(final ContentContribution contribution, final Member member) {
        final Locale locale = memberLocale(member);
        final Context context = newContext(locale);
        context.setVariable("member", member);
        context.setVariable("contribution", contribution);
        send(member, locale, "email.contribution-acknowledgement.subject", "contribution-acknowledgement", context);
    }

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendMembershipDunningNotice(final Member member, final MembershipStatus status) {
        final Locale locale = memberLocale(member);
        final Context context = newContext(locale);
        context.setVariable("member", member);
        context.setVariable("status", status);
        send(member, locale, "email.dunning.subject", "membership-dunning-notice", context);
    }

    @Override
    @Async(EmailAsyncConfiguration.EXECUTOR_BEAN_NAME)
    public void sendMembershipRenewalReminder(final Member member, final int cycleYear) {
        final Locale locale = memberLocale(member);
        final Context context = newContext(locale);
        context.setVariable("member", member);
        context.setVariable("cycleYear", cycleYear);
        send(member, locale, "email.renewal-reminder.subject", "membership-renewal-reminder", context);
    }

    /**
     * A fresh {@link Context} pre-seeded with {@code publicBaseUrl}, so every template/fragment
     * (shell header/footer, CTA buttons) can build absolute links without ever hardcoding the
     * site domain itself.
     */
    private Context newContext(final Locale locale) {
        final Context context = new Context(locale);
        context.setVariable("publicBaseUrl", publicBaseUrl);
        return context;
    }

    private void send(final Member member, final Locale locale, final String subjectKey, final String templateName, final Context context) {
        try {
            final String subject = messageSource.getMessage(subjectKey, null, locale);
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

    /**
     * Resolves the {@link Locale} the email must be rendered in from {@link Member#locale()}
     * (a bare language tag, e.g. {@code "fr"}/{@code "en"}) — falls back to
     * {@link #DEFAULT_LOCALE} (French) if unset/unparseable, never a hardcoded locale chosen
     * regardless of the actual recipient.
     */
    private Locale memberLocale(final Member member) {
        final String tag = member.locale();
        if (tag == null || tag.isBlank()) {
            return DEFAULT_LOCALE;
        }
        return Locale.forLanguageTag(tag);
    }
}
