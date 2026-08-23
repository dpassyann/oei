package global.oei.application.web.resource.member.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

class MembershipServiceTest {

    @Test
    void givenMissingMemberAndMembership_whenGetMyMembership_thenAutoProvisionsMemberFirst() {
        final SecurityContextPort securityContextPort = mock(SecurityContextPort.class);
        final MemberPort memberPort = mock(MemberPort.class);
        final MembershipLookupPort membershipLookupPort = mock(MembershipLookupPort.class);
        final MembershipService service = new MembershipService(securityContextPort, memberPort, membershipLookupPort);

        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final AuthenticatedIdentity identity =
                new AuthenticatedIdentity(memberId.value().toString(), "jane@example.org", "Jane Doe", Set.of("member"), null);

        when(securityContextPort.currentIdentity()).thenReturn(Optional.of(identity));
        when(memberPort.findById(memberId)).thenReturn(Optional.empty());

        final Member savedMember = new Member(
                memberId,
                "f267e070-2fd5-5f83-a48b-9a733db64489",
                "Jane Doe",
                "Jane Doe",
                "fr",
                "FR",
                global.oei.domain.shared.member.AccountType.REAL,
                Instant.now());
        when(memberPort.save(org.mockito.ArgumentMatchers.any(Member.class))).thenReturn(savedMember);

        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        final Membership savedMembership = new Membership(
                memberId,
                MembershipTier.STANDARD,
                MembershipStatus.PENDING,
                Instant.now(),
                null,
                null);
        when(membershipLookupPort.save(org.mockito.ArgumentMatchers.any(Membership.class))).thenReturn(savedMembership);

        final Membership membership = service.getMyMembership();

        assertThat(membership.tier()).isEqualTo(MembershipTier.STANDARD);
        assertThat(membership.status()).isEqualTo(MembershipStatus.PENDING);

        final InOrder inOrder = inOrder(memberPort, membershipLookupPort);
        inOrder.verify(memberPort).save(org.mockito.ArgumentMatchers.any(Member.class));
        inOrder.verify(membershipLookupPort).save(org.mockito.ArgumentMatchers.any(Membership.class));
    }

    @Test
    void givenConcurrentMembershipProvisioning_whenMembershipBecomesVisibleOnRetry_thenReturnsIt() {
        final SecurityContextPort securityContextPort = mock(SecurityContextPort.class);
        final MemberPort memberPort = mock(MemberPort.class);
        final MembershipLookupPort membershipLookupPort = mock(MembershipLookupPort.class);
        final MembershipService service = new MembershipService(securityContextPort, memberPort, membershipLookupPort);

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
                global.oei.domain.shared.member.AccountType.REAL,
                Instant.now());
        final Membership membership = new Membership(
                memberId,
                MembershipTier.STANDARD,
                MembershipStatus.PENDING,
                Instant.now(),
                null,
                null);

        when(securityContextPort.currentIdentity()).thenReturn(Optional.of(identity));
        when(memberPort.findById(memberId)).thenReturn(Optional.of(member));
        when(membershipLookupPort.findByMemberId(memberId))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(membership));
        when(membershipLookupPort.save(org.mockito.ArgumentMatchers.any(Membership.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("duplicate"));

        final Membership resolved = service.getMyMembership();

        assertThat(resolved).isEqualTo(membership);
        org.mockito.Mockito.verify(membershipLookupPort, times(3)).findByMemberId(memberId);
    }
}

