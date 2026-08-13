package global.oei.domain.core.profile;

import java.util.Objects;

import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.UpdateMyProfileUseCase;

public class UpdateMyProfileService implements UpdateMyProfileUseCase {

    private final ProfileLookupPort profileLookupPort;

    public UpdateMyProfileService(final ProfileLookupPort profileLookupPort) {
        this.profileLookupPort = Objects.requireNonNull(profileLookupPort, "profileLookupPort must not be null");
    }

    @Override
    public ProfessionalProfile execute(final ProfessionalProfile profile) {
        return profileLookupPort.save(profile.withRecomputedCompleteness());
    }
}
