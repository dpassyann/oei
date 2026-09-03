package global.oei.domain.core.profile;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.profile.GetMemberBootstrapUseCase;
import global.oei.domain.shared.profile.MemberBootstrap;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.ProfileSource;
import global.oei.domain.shared.profile.ProfileStatus;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

/**
 * Resolves {@link MemberBootstrap} for the current authenticated caller.
 *
 * <p>The bootstrap result is the first call made by the frontend after authentication.
 * It must never throw for an absent profile — instead it returns
 * {@link ProfileStatus#ONBOARDING_REQUIRED}.</p>
 *
 * <p>Logic (per the owner's business rule):</p>
 * <ol>
 *   <li>If no profile is found → {@link ProfileStatus#ONBOARDING_REQUIRED}</li>
 *   <li>If a profile exists but neither its LinkedIn-basic name/photo nor a completed CV
 *       import ({@link ProfileImportStatus#COMPLETED}) has happened →
 *       {@link ProfileStatus#ONBOARDING_REQUIRED}</li>
 *   <li>If the LinkedIn-basic name/photo has been loaded but the CV import has not
 *       completed yet → {@link ProfileStatus#ONBOARDING_IN_PROGRESS}</li>
 *   <li>Otherwise (the CV import has completed — with or without a LinkedIn-basic import),
 *       fall back to completeness: ≥{@value #READY_THRESHOLD} →
 *       {@link ProfileStatus#READY}, otherwise {@link ProfileStatus#PROFILE_INCOMPLETE}</li>
 * </ol>
 *
 * <p>{@link ProfileStatus#SUSPENDED} is a documented, valid future state (administrative
 * suspension, or an inconsistency between CV and LinkedIn data) but is deliberately NOT
 * computed here yet — out of scope for this pass.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class GetMemberBootstrapService implements GetMemberBootstrapUseCase {

    private static final int READY_THRESHOLD = 50;

    @NonNull
    private final ProfileLookupPort profileLookupPort;

    @NonNull
    private final MembershipLookupPort membershipLookupPort;

    @NonNull
    private final ProfileImportPort profileImportPort;

    @Override
    public MemberBootstrap execute(final MemberId memberId) {
        final var profileOpt = profileLookupPort.findByMemberId(memberId);
        final var membershipOpt = membershipLookupPort.findByMemberId(memberId);
        final var membershipStatus = membershipOpt.map(m -> m.status()).orElse(null);
        final ProfileImportStatus cvStatus = profileImportPort.findLatestByMemberId(memberId)
                .map(profileImport -> profileImport.status())
                .orElse(null);

        if (profileOpt.isEmpty()) {
            log.info("bootstrap: no profile found for memberId={}, returning ONBOARDING_REQUIRED", memberId);
            return new MemberBootstrap(memberId, ProfileStatus.ONBOARDING_REQUIRED, membershipStatus, null, cvStatus);
        }

        final var profile = profileOpt.get();
        final ProfileStatus profileStatus = resolveProfileStatus(profile, cvStatus);
        log.debug("bootstrap: memberId={} profileStatus={} membershipStatus={} cvStatus={}",
                memberId, profileStatus, membershipStatus, cvStatus);
        return new MemberBootstrap(memberId, profileStatus, membershipStatus, memberId.value().toString(), cvStatus);
    }

    private static ProfileStatus resolveProfileStatus(
            final ProfessionalProfile profile, final ProfileImportStatus cvStatus) {
        final boolean nameAndPhotoLoaded = hasLinkedinBasicNameAndPhoto(profile.source());
        final boolean cvExtracted = cvStatus == ProfileImportStatus.COMPLETED;

        if (!nameAndPhotoLoaded && !cvExtracted) {
            return ProfileStatus.ONBOARDING_REQUIRED;
        }
        if (nameAndPhotoLoaded && !cvExtracted) {
            return ProfileStatus.ONBOARDING_IN_PROGRESS;
        }
        return computeProfileStatusFromCompleteness(profile.completenessScore());
    }

    /**
     * "Loaded my name and photo" maps concretely to {@link ProfileSource#LINKEDIN_BASIC}/
     * {@link ProfileSource#LINKEDIN_AND_CV}: the only path that populates {@link
     * global.oei.domain.shared.member.Member}'s name from LinkedIn OpenID basic identity (see
     * {@code ImportLinkedinBasicService}) — LinkedIn's OAuth "basic" scope is documented as
     * carrying name, photo, email and locale (see {@link ProfileSource}'s Javadoc).
     */
    private static boolean hasLinkedinBasicNameAndPhoto(final ProfileSource source) {
        return source == ProfileSource.LINKEDIN_BASIC || source == ProfileSource.LINKEDIN_AND_CV;
    }

    private static ProfileStatus computeProfileStatusFromCompleteness(final int completenessScore) {
        if (completenessScore >= READY_THRESHOLD) {
            return ProfileStatus.READY;
        }
        return ProfileStatus.PROFILE_INCOMPLETE;
    }
}
