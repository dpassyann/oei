package global.oei.domain.core.profile;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.profile.GetMemberBootstrapUseCase;
import global.oei.domain.shared.profile.MemberBootstrap;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.ProfileStatus;

/**
 * Resolves {@link MemberBootstrap} for the current authenticated caller.
 *
 * <p>The bootstrap result is the first call made by the frontend after authentication.
 * It must never throw for an absent profile — instead it returns
 * {@link ProfileStatus#ONBOARDING_REQUIRED}.</p>
 *
 * <p>Logic:</p>
 * <ol>
 *   <li>If no profile is found → {@link ProfileStatus#ONBOARDING_REQUIRED}</li>
 *   <li>If profile exists with completeness = 0 → {@link ProfileStatus#PROFILE_INCOMPLETE}</li>
 *   <li>If profile completeness ≥ threshold (≥50) → {@link ProfileStatus#READY}</li>
 *   <li>Otherwise → {@link ProfileStatus#PROFILE_INCOMPLETE}</li>
 * </ol>
 */
@Slf4j
@RequiredArgsConstructor
public class GetMemberBootstrapService implements GetMemberBootstrapUseCase {

    private static final int READY_THRESHOLD = 50;

    @NonNull
    private final ProfileLookupPort profileLookupPort;

    @NonNull
    private final MembershipLookupPort membershipLookupPort;

    @Override
    public MemberBootstrap execute(final MemberId memberId) {
        final var profileOpt = profileLookupPort.findByMemberId(memberId);
        final var membershipOpt = membershipLookupPort.findByMemberId(memberId);
        final var membershipStatus = membershipOpt.map(m -> m.status()).orElse(null);

        if (profileOpt.isEmpty()) {
            log.info("bootstrap: no profile found for memberId={}, returning ONBOARDING_REQUIRED", memberId);
            return new MemberBootstrap(memberId, ProfileStatus.ONBOARDING_REQUIRED, membershipStatus, null);
        }

        final var profile = profileOpt.get();
        final ProfileStatus profileStatus = computeProfileStatus(profile.completenessScore());
        log.debug("bootstrap: memberId={} profileStatus={} membershipStatus={}", memberId, profileStatus, membershipStatus);
        return new MemberBootstrap(memberId, profileStatus, membershipStatus, memberId.value().toString());
    }

    private static ProfileStatus computeProfileStatus(final int completenessScore) {
        if (completenessScore >= READY_THRESHOLD) {
            return ProfileStatus.READY;
        }
        return ProfileStatus.PROFILE_INCOMPLETE;
    }
}


