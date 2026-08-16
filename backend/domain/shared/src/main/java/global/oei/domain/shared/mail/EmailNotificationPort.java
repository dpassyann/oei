package global.oei.domain.shared.mail;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.membership.MembershipStatus;
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

    /**
     * Dunning/lapse notice sent once a member's {@link MembershipStatus} reaches
     * {@code GRACE_PERIOD} or {@code EXPIRED}: warns of restricted features and links to the
     * renewal payment page. See {@code .prompt/plan/store/03-emails-transactionnels.md} for
     * the transactional-email posture this follows; no {@code @Scheduled} trigger exists yet
     * for this in this codebase — wiring an automatic trigger on the membership-status
     * transition is a follow-up TODO, this method only covers the send itself.
     */
    void sendMembershipDunningNotice(Member member, MembershipStatus status);

    /**
     * Proactive, friendly reminder sent before a member's annual cycle ends, encouraging
     * renewal ahead of the deadline. Same automatic-trigger TODO as
     * {@link #sendMembershipDunningNotice(Member, MembershipStatus)}.
     */
    void sendMembershipRenewalReminder(Member member, int cycleYear);
}
