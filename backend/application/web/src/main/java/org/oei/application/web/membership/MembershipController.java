package org.oei.application.web.membership;

import java.util.Objects;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import org.oei.application.web.MemberProfileApi;
import org.oei.application.web.model.MembershipDTO;
import org.oei.domain.shared.member.MemberId;
import org.oei.domain.shared.membership.Membership;
import org.oei.domain.shared.membership.MembershipLookupPort;
import org.oei.domain.shared.security.AuthenticatedIdentity;
import org.oei.domain.shared.security.SecurityContextPort;

/**
 * Implements {@code GET /api/member/v1/membership}: resolves the current caller's identity
 * via {@link SecurityContextPort}, loads their {@link Membership}, and maps it to the
 * generated {@link MembershipDTO} at the boundary.
 *
 * <p>Only this operation is implemented at this bootstrap stage; every other operation in
 * {@link MemberProfileApi} (and the other ~30 generated API interfaces) falls back to the
 * generator's default {@code 501 Not Implemented} behavior until implemented.</p>
 *
 * <p>Depends only on {@code domain-shared} — the {@link MembershipLookupPort} it uses is a
 * port, resolved to a concrete adapter only by {@code application-runtime}, the composition
 * root.</p>
 */
@RestController
public class MembershipController implements MemberProfileApi {

    private final SecurityContextPort securityContextPort;
    private final MembershipLookupPort membershipLookupPort;

    public MembershipController(
            final SecurityContextPort securityContextPort, final MembershipLookupPort membershipLookupPort) {
        this.securityContextPort = Objects.requireNonNull(securityContextPort, "securityContextPort must not be null");
        this.membershipLookupPort = Objects.requireNonNull(membershipLookupPort, "membershipLookupPort must not be null");
    }

    @Override
    public ResponseEntity<MembershipDTO> getMyMembership() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        final Membership membership = membershipLookupPort.findByMemberId(MemberId.of(identity.subject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        return ResponseEntity.ok(MembershipDtoMapper.toDto(membership));
    }
}
