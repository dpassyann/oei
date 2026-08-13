package global.oei.domain.core.profile;

import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.GetMyProfileUseCase;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;

public class GetMyProfileService implements GetMyProfileUseCase {

    private final ProfileLookupPort profileLookupPort;

    public GetMyProfileService(final ProfileLookupPort profileLookupPort) {
        this.profileLookupPort = Objects.requireNonNull(profileLookupPort, "profileLookupPort must not be null");
    }

    @Override
    public ProfessionalProfile execute(final MemberId memberId) {
        return profileLookupPort.findByMemberId(memberId).orElseGet(() -> blankProfile(memberId));
    }

    private static ProfessionalProfile blankProfile(final MemberId memberId) {
        return new ProfessionalProfile(
                memberId,
                null,
                null,
                null,
                Availability.NOT_AVAILABLE,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                0);
    }
}
