package global.oei.application.web.resource.member.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import global.oei.application.web.model.MemberDTO;
import global.oei.application.web.model.MembershipStatusDTO;
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

class MemberSelfServiceTest {

    @Test
    void givenConcurrentMemberProvisioning_whenMemberBecomesVisibleOnRetry_thenReturnsCurrentMember() {
        final SecurityContextPort securityContextPort = mock(SecurityContextPort.class);
        final MemberPort memberPort = mock(MemberPort.class);
        final MembershipLookupPort membershipLookupPort = mock(MembershipLookupPort.class);
        final MemberSelfService service = new MemberSelfService(securityContextPort, memberPort, membershipLookupPort);

        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final AuthenticatedIdentity identity =
                new AuthenticatedIdentity(memberId.value().toString(), "jane@example.org", "Jane Doe", Set.of("member"), null);
        final Member member = new Member(
                memberId,
                "f267e070-2fd5-5f83-a48b-9a733db64489",
                "Jane Doe",
                "Jane Doe",
                "fr",
                "FR",
                AccountType.REAL,
                Instant.now());
        final Membership membership = new Membership(
                memberId,
                MembershipTier.STANDARD,
                MembershipStatus.PENDING,
                Instant.now(),
                null,
                null);

        when(securityContextPort.currentIdentity()).thenReturn(Optional.of(identity));
        when(memberPort.findById(memberId))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(member));
        when(memberPort.save(org.mockito.ArgumentMatchers.any(Member.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate"));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.of(membership));

        final MemberDTO currentMember = service.getCurrentMember();

        assertThat(currentMember.getId()).isEqualTo(memberId.value().toString());
        assertThat(currentMember.getMembership().getStatus()).isEqualTo(MembershipStatusDTO.PENDING);
        verify(memberPort, times(3)).findById(memberId);
    }
}





