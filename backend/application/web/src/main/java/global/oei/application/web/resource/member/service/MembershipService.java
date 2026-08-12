package global.oei.application.web.resource.member.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@link MembershipAdapter} by resolving the current caller's identity via
 * {@link SecurityContextPort} and loading their {@link Membership} via
 * {@link MembershipLookupPort} — both {@code domain-shared} interfaces, resolved to
 * concrete beans by {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}. This
 * class never references a concrete {@code domain-core}/infrastructure type.
 */
@RequiredArgsConstructor
public class MembershipService implements MembershipAdapter {

    private final SecurityContextPort securityContextPort;
    private final MembershipLookupPort membershipLookupPort;

    @Override
    public Membership getMyMembership() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        return membershipLookupPort.findByMemberId(MemberId.of(identity.subject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
