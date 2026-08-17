package global.oei.domain.core.member;

import java.time.Instant;
import java.util.Locale;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberAlreadyRegisteredException;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.member.RegisterAccountUseCase;

/**
 * Creates the {@link Member} identity row for {@code registerAccount}. Intentionally minimal
 * for this bootstrap stage: {@code AccountRegistration} only carries email/locale/country/
 * consent/oidcSubject, none of which map to a full professional profile, so
 * {@link Member#displayName()}/{@link Member#legalName()} are derived from the email's local
 * part as a placeholder pending onboarding completion via the existing
 * {@code PUT /api/member/v1/profile} operation. No Keycloak account provisioning, no email
 * verification flow, and no {@code Membership} row are created here — membership starts once
 * OEI staff nominate/approve the member through the existing membership bounded context,
 * out of this operation's scope. {@code oidcSubject}/{@code consentAccepted} are accepted (per
 * the contract) but not yet persisted: there is no dedicated column for them at this iteration
 * (no email column either — email is not part of the {@link Member} aggregate yet).
 *
 * <p>Because there is no email column, uniqueness/{@code 409} detection relies on the
 * {@code publicSlug} derived from the email's local part: registering the same email twice
 * collides on that slug and is correctly rejected. A known limitation: two distinct emails
 * that share the same local part (e.g. {@code a@x.org} and {@code a@y.org}) would also
 * collide — acceptable at this bootstrap stage, to be fixed once email becomes a first-class
 * {@link Member} field.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class RegisterAccountService implements RegisterAccountUseCase {

    @NonNull
    private final MemberPort memberPort;

    @Override
    public Member execute(
            final String email, final String locale, final String country,
            final boolean consentAccepted,
            final String oidcSubject) {
        log.debug("registerAccount: email={} locale={} country={} consentAccepted={}",
                email, locale, country, consentAccepted);
        final String localPart = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        final String slug = localPart.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (memberPort.findByPublicSlug(slug).isPresent()) {
            log.info("registerAccount: rejected duplicate slug={} email={}", slug, email);
            throw new MemberAlreadyRegisteredException("an account already exists for " + email);
        }
        final Member member = new Member(MemberId.newId(), slug, localPart, localPart, locale, country,
                AccountType.REAL, Instant.now());
        log.info("registerAccount: account created memberId={} slug={}", member.id(), slug);
        return memberPort.save(member);
    }
}
