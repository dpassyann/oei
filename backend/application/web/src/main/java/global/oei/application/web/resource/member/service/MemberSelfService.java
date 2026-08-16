package global.oei.application.web.resource.member.service;

import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.model.MemberDTO;
import global.oei.application.web.resource.member.adapter.MemberSelfAdapter;
import global.oei.application.web.resource.member.mapper.MemberDtoMapper;
import global.oei.application.web.resource.member.mapper.MembershipDtoMapper;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@link MemberSelfAdapter}.
 *
 * <p>Auto-provisioning logic: when a user registers via the Keycloak native form (no call
 * to {@code POST /api/public/v1/accounts}), they have a valid JWT but no {@code Member} row
 * in the OEI database yet.  This service performs an idempotent "get or create" pattern:</p>
 * <ol>
 *   <li>Look up {@code Member} by the JWT {@code sub} (Keycloak subject = {@link MemberId}).</li>
 *   <li>If absent, create one from the JWT claims ({@code name}/{@code email}/{@code locale}).</li>
 *   <li>Look up {@code Membership} for that member.</li>
 *   <li>If absent, create a {@code BRONZE}/{@code PENDING} starter membership.</li>
 * </ol>
 * All four operations are wrapped in a single transaction so concurrent first-time requests
 * cannot create duplicate rows (the {@code member} table has a unique constraint on {@code id},
 * and {@code membership} has one on {@code member_id}).
 */
@Service
@RequiredArgsConstructor
public class MemberSelfService implements MemberSelfAdapter {

    private final SecurityContextPort securityContextPort;
    private final MemberPort memberPort;
    private final MembershipLookupPort membershipLookupPort;

    @Override
    @Transactional
    public MemberDTO getCurrentMember() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        final MemberId memberId = MemberId.of(identity.subject());

        // --- 1. Get or auto-provision Member ---
        final Member member = memberPort.findById(memberId)
                .orElseGet(() -> provisionMember(memberId, identity));

        // --- 2. Get or auto-provision Membership ---
        final Membership membership = membershipLookupPort.findByMemberId(memberId)
                .orElseGet(() -> membershipLookupPort.save(provisionMembership(memberId)));

        // --- 3. Build response DTO with embedded membership ---
        final MemberDTO dto = MemberDtoMapper.toDto(member);
        dto.setMembership(MembershipDtoMapper.toDto(membership));
        return dto;
    }

    private Member provisionMember(final MemberId memberId, final AuthenticatedIdentity identity) {
        final String displayName = resolveDisplayName(identity);
        final String slug = toSlug(memberId.value().toString());
        final Member member = new Member(
                memberId, slug, displayName, displayName,
                "fr", "FR",
                AccountType.REAL, Instant.now());
        return memberPort.save(member);
    }

    private static Membership provisionMembership(final MemberId memberId) {
        return new Membership(memberId, MembershipTier.STANDARD, MembershipStatus.PENDING,
                Instant.now(), null, null);
    }

    private static String resolveDisplayName(final AuthenticatedIdentity identity) {
        if (identity.displayName() != null && !identity.displayName().isBlank()) {
            return identity.displayName();
        }
        if (identity.email() != null && !identity.email().isBlank()) {
            final String local = identity.email().contains("@")
                    ? identity.email().substring(0, identity.email().indexOf('@'))
                    : identity.email();
            return local;
        }
        return identity.subject();
    }

    private static String toSlug(final String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}


