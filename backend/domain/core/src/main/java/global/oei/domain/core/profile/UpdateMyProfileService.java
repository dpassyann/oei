package global.oei.domain.core.profile;

import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.UpdateMyProfileUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Default {@code UpdateMyProfileUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class UpdateMyProfileService implements UpdateMyProfileUseCase {

    @NonNull
    private final ProfileLookupPort profileLookupPort;

    @Override
    public ProfessionalProfile execute(final ProfessionalProfile profile) {
        log.debug("updateMyProfile: memberId={} requested", profile.memberId());
        return profileLookupPort.save(profile.withRecomputedCompleteness());
    }
}
