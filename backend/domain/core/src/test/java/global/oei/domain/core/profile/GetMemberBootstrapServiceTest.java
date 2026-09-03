package global.oei.domain.core.profile;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.MemberBootstrap;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import global.oei.domain.shared.profile.ProfileSource;
import global.oei.domain.shared.profile.ProfileStatus;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GetMemberBootstrapServiceTest {

    private final ProfileLookupPort profileLookupPort = mock(ProfileLookupPort.class);
    private final MembershipLookupPort membershipLookupPort = mock(MembershipLookupPort.class);
    private final ProfileImportPort profileImportPort = mock(ProfileImportPort.class);
    private final GetMemberBootstrapService service =
            new GetMemberBootstrapService(profileLookupPort, membershipLookupPort, profileImportPort);

    @Test
    void execute_returnsOnboardingRequiredWhenNoProfileExists() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(profileImportPort.findLatestByMemberId(memberId)).thenReturn(Optional.empty());

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.profileStatus()).isEqualTo(ProfileStatus.ONBOARDING_REQUIRED);
        assertThat(bootstrap.profileId()).isNull();
        assertThat(bootstrap.cvStatus()).isNull();
    }

    @Test
    void execute_returnsOnboardingRequiredWhenProfileExistsButNeitherLinkedinNorCvImportWasDone() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId)).thenReturn(Optional.of(profile(memberId, null, 0)));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(profileImportPort.findLatestByMemberId(memberId)).thenReturn(Optional.empty());

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.profileStatus()).isEqualTo(ProfileStatus.ONBOARDING_REQUIRED);
        assertThat(bootstrap.cvStatus()).isNull();
    }

    @Test
    void execute_returnsOnboardingInProgressWhenLinkedinBasicLoadedButCvImportNotCompleted() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId))
                .thenReturn(Optional.of(profile(memberId, ProfileSource.LINKEDIN_BASIC, 0)));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(profileImportPort.findLatestByMemberId(memberId))
                .thenReturn(Optional.of(profileImport(memberId, ProfileImportStatus.AI_PROCESSING)));

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.profileStatus()).isEqualTo(ProfileStatus.ONBOARDING_IN_PROGRESS);
        assertThat(bootstrap.cvStatus()).isEqualTo(ProfileImportStatus.AI_PROCESSING);
    }

    @Test
    void execute_returnsOnboardingInProgressWhenLinkedinBasicLoadedAndNoCvImportEverStarted() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId))
                .thenReturn(Optional.of(profile(memberId, ProfileSource.LINKEDIN_BASIC, 0)));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(profileImportPort.findLatestByMemberId(memberId)).thenReturn(Optional.empty());

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.profileStatus()).isEqualTo(ProfileStatus.ONBOARDING_IN_PROGRESS);
        assertThat(bootstrap.cvStatus()).isNull();
    }

    @Test
    void execute_returnsReadyWhenLinkedinBasicLoadedAndCvImportCompletedWithHighCompleteness() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId))
                .thenReturn(Optional.of(profile(memberId, ProfileSource.LINKEDIN_AND_CV, 80)));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(profileImportPort.findLatestByMemberId(memberId))
                .thenReturn(Optional.of(profileImport(memberId, ProfileImportStatus.COMPLETED)));

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.profileStatus()).isEqualTo(ProfileStatus.READY);
        assertThat(bootstrap.cvStatus()).isEqualTo(ProfileImportStatus.COMPLETED);
    }

    @Test
    void execute_returnsProfileIncompleteWhenCvImportCompletedButLowCompleteness() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId))
                .thenReturn(Optional.of(profile(memberId, ProfileSource.CV_IMPORTED, 10)));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.empty());
        when(profileImportPort.findLatestByMemberId(memberId))
                .thenReturn(Optional.of(profileImport(memberId, ProfileImportStatus.COMPLETED)));

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.profileStatus()).isEqualTo(ProfileStatus.PROFILE_INCOMPLETE);
    }

    @Test
    void execute_includesMembershipStatusWhenMembershipExists() {
        final MemberId memberId = MemberId.newId();
        when(profileLookupPort.findByMemberId(memberId))
                .thenReturn(Optional.of(profile(memberId, ProfileSource.LINKEDIN_AND_CV, 80)));
        when(membershipLookupPort.findByMemberId(memberId)).thenReturn(Optional.of(new Membership(
                memberId, MembershipTier.STANDARD, MembershipStatus.ACTIVE, Instant.now(), null, null)));
        when(profileImportPort.findLatestByMemberId(memberId))
                .thenReturn(Optional.of(profileImport(memberId, ProfileImportStatus.COMPLETED)));

        final MemberBootstrap bootstrap = service.execute(memberId);

        assertThat(bootstrap.membershipStatus()).isEqualTo(MembershipStatus.ACTIVE);
    }

    private static ProfessionalProfile profile(
            final MemberId memberId, final ProfileSource source, final int completenessScore) {
        return new ProfessionalProfile(
                memberId, source, "Title", "Summary", "Paris", Availability.AVAILABLE,
                List.of("ia"), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
                null, completenessScore);
    }

    private static ProfileImport profileImport(final MemberId memberId, final ProfileImportStatus status) {
        final Instant now = Instant.now();
        ProfileImport session = ProfileImport.create(
                java.util.UUID.randomUUID().toString(), memberId, ProfileImportSource.CV_PDF, now);
        for (final ProfileImportStatus step : stepsTo(status)) {
            session = session.transitionTo(step, now, null);
        }
        return session;
    }

    private static List<ProfileImportStatus> stepsTo(final ProfileImportStatus target) {
        return switch (target) {
            case CREATED -> List.of();
            case DOCUMENT_UPLOADED -> List.of(ProfileImportStatus.DOCUMENT_UPLOADED);
            case EXTRACTING -> List.of(ProfileImportStatus.DOCUMENT_UPLOADED, ProfileImportStatus.EXTRACTING);
            case AI_PROCESSING -> List.of(
                    ProfileImportStatus.DOCUMENT_UPLOADED, ProfileImportStatus.EXTRACTING, ProfileImportStatus.AI_PROCESSING);
            case REVIEW_REQUIRED -> List.of(
                    ProfileImportStatus.DOCUMENT_UPLOADED, ProfileImportStatus.EXTRACTING,
                    ProfileImportStatus.AI_PROCESSING, ProfileImportStatus.REVIEW_REQUIRED);
            case CONFIRMED -> List.of(
                    ProfileImportStatus.DOCUMENT_UPLOADED, ProfileImportStatus.EXTRACTING,
                    ProfileImportStatus.AI_PROCESSING, ProfileImportStatus.REVIEW_REQUIRED, ProfileImportStatus.CONFIRMED);
            case COMPLETED -> List.of(
                    ProfileImportStatus.DOCUMENT_UPLOADED, ProfileImportStatus.EXTRACTING,
                    ProfileImportStatus.AI_PROCESSING, ProfileImportStatus.REVIEW_REQUIRED,
                    ProfileImportStatus.CONFIRMED, ProfileImportStatus.COMPLETED);
            case FAILED -> List.of(ProfileImportStatus.FAILED);
            case EXPIRED -> List.of(ProfileImportStatus.EXPIRED);
        };
    }
}
