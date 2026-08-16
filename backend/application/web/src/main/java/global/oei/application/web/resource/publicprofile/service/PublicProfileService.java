package global.oei.application.web.resource.publicprofile.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.publicprofile.adapter.PublicProfileAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.publicprofile.DigitalBusinessCard;
import global.oei.domain.shared.publicprofile.GenerateDigitalBusinessCardUseCase;
import global.oei.domain.shared.publicprofile.PublicProfile;
import global.oei.domain.shared.publicprofile.PublicProfilePort;
import global.oei.domain.shared.publicprofile.PublishPublicProfileUseCase;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicProfileService implements PublicProfileAdapter {

    private final SecurityContextPort securityContextPort;
    private final PublicProfilePort publicProfilePort;
    private final PublishPublicProfileUseCase publishPublicProfileUseCase;
    private final GenerateDigitalBusinessCardUseCase generateDigitalBusinessCardUseCase;
    private final MembershipLookupPort membershipLookupPort;

    @Override
    public PublicProfile getMySettings() {
        return publicProfilePort.findByMemberId(currentMemberId());
    }

    @Override
    public PublicProfile publish(final String publicSlug, final List<String> visibleFields, final String seoDescription) {
        return publishPublicProfileUseCase.execute(currentMemberId(), publicSlug, visibleFields, seoDescription);
    }

    @Override
    public DigitalBusinessCard generateDigitalCard() {
        final MemberId memberId = currentMemberId();
        final PublicProfile profile = publicProfilePort.findByMemberId(memberId);
        final MembershipTier tier = membershipLookupPort.findByMemberId(memberId).map(Membership::tier).orElse(null);
        return generateDigitalBusinessCardUseCase.execute(memberId, profile.publicSlug(), tier);
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
