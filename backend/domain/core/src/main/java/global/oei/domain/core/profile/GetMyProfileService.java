package global.oei.domain.core.profile;

import java.util.List;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.GetMyProfileUseCase;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Default {@code GetMyProfileUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class GetMyProfileService implements GetMyProfileUseCase {

    @NonNull
    private final ProfileLookupPort profileLookupPort;

    @Override
    public ProfessionalProfile execute(final MemberId memberId) {
        final ProfessionalProfile profile = profileLookupPort.findByMemberId(memberId).orElseGet(() -> {
            log.info("getMyProfile: no profile found, returning blank profile for memberId={}", memberId);
            return blankProfile(memberId);
        });
        log.debug("getMyProfile: profile resolved for memberId={}", memberId);
        return profile;
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
