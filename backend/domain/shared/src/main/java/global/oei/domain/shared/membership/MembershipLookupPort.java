package global.oei.domain.shared.membership;

import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for resolving a member's current {@link Membership}.
 *
 * <p>Implemented by {@code infrastructure-persistence} ({@code MembershipPersistenceAdapter}),
 * consumed by {@code application-web} to serve {@code GET /api/member/v1/membership}. Declared
 * here (not as a full {@code domain-core} use case) because at this bootstrap stage it is a
 * single read with no orchestration; a richer membership use case can wrap it later without
 * changing this port's contract.</p>
 */
public interface MembershipLookupPort {

    Optional<Membership> findByMemberId(MemberId memberId);

    /**
     * Persists a new {@link Membership}. Used by the auto-provisioning path in
     * {@code MemberSelfService} when a member registers via the Keycloak native form
     * (without calling {@code POST /api/public/v1/accounts}) and hits
     * {@code GET /api/member/v1/members/me} for the first time.
     */
    Membership save(Membership membership);
}
