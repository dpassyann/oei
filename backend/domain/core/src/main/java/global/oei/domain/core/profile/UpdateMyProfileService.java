package global.oei.domain.core.profile;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.network.RecordCompensationDeclarationsPort;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.UpdateMyProfileUseCase;

/**
 * Default {@code UpdateMyProfileUseCase} implementation.
 *
 * <p>Besides persisting the profile, it keeps the Professional Neural Network's anonymized
 * {@code compensation_declaration} pool in sync with whatever {@code Experience} entries now
 * carry a {@code grossAnnualSalary} — see {@link ProfessionalProfile#deriveCompensationDeclarations(String)}
 * for the derivation rule and its open modeling question.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class UpdateMyProfileService implements UpdateMyProfileUseCase {

    @NonNull
    private final ProfileLookupPort profileLookupPort;
    @NonNull
    private final MemberPort memberPort;
    @NonNull
    private final RecordCompensationDeclarationsPort recordCompensationDeclarationsPort;

    @Override
    public ProfessionalProfile execute(final ProfessionalProfile profile) {
        log.debug("updateMyProfile: memberId={} requested", profile.memberId());
        final ProfessionalProfile saved = profileLookupPort.save(profile.withRecomputedCompleteness());
        final String country = memberPort.findById(saved.memberId()).map(Member::country).orElse(null);
        recordCompensationDeclarationsPort.replace(saved.memberId(), saved.deriveCompensationDeclarations(country));
        return saved;
    }
}
