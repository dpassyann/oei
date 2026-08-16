package global.oei.domain.shared.mail;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.store.Order;

/**
 * Outbound port for business-reassurance transactional emails sent by the Spring backend
 * itself — never account lifecycle emails (activation, registration, MFA), which stay Keycloak's
 * responsibility (see {@code 03-emails-transactionnels.md §0}).
 *
 * <p>One explicit, typed method per email use case rather than a generic
 * {@code send(EmailType, Map<String,Object>)} — keeps the port self-documenting and type-safe.
 * Implementations (infrastructure-mail) must dispatch asynchronously: a failed/slow SMTP send
 * must never fail or slow down the triggering business transaction.</p>
 */
public interface EmailNotificationPort {

    void sendMembershipFeePaymentConfirmation(MembershipFeePayment payment, Member member);

    void sendOrderConfirmation(Order order, Member member);

    void sendContributionAcknowledgement(ContentContribution contribution, Member member);
}
