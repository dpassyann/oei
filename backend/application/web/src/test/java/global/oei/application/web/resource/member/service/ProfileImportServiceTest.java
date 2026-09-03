package global.oei.application.web.resource.member.service;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.ImportLinkedinBasicUseCase;
import global.oei.domain.shared.profile.LinkedinAuthorizationPort;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profileimport.InitiateProfileImportUseCase;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProfileImportServiceTest {

    private static final MemberId MEMBER_ID = MemberId.newId();

    private final SecurityContextPort securityContextPort = mock(SecurityContextPort.class);
    private final LinkedinAuthorizationPort linkedinAuthorizationPort = mock(LinkedinAuthorizationPort.class);
    private final ImportLinkedinBasicUseCase importLinkedinBasicUseCase = mock(ImportLinkedinBasicUseCase.class);
    private final ProfileImportPort profileImportPort = mock(ProfileImportPort.class);
    private final InitiateProfileImportUseCase initiateProfileImportUseCase = mock(InitiateProfileImportUseCase.class);

    private final ProfileImportService service = new ProfileImportService(
            securityContextPort, linkedinAuthorizationPort, importLinkedinBasicUseCase, profileImportPort,
            initiateProfileImportUseCase);

    @Test
    void initiateFromCv_delegatesToUseCaseWithAuthenticatedMemberId() {
        authenticateAs(MEMBER_ID);
        final ProfileImport expected = ProfileImport.create(
                "import-1", MEMBER_ID, ProfileImportSource.CV_PDF, Instant.now());
        when(initiateProfileImportUseCase.execute(MEMBER_ID, ProfileImportSource.CV_PDF)).thenReturn(expected);

        assertThat(service.initiateFromCv(ProfileImportSource.CV_PDF)).isEqualTo(expected);
    }

    @Test
    void initiateFromCv_throwsUnauthorizedWhenNoAuthenticatedIdentity() {
        when(securityContextPort.currentIdentity()).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.initiateFromCv(ProfileImportSource.CV_PDF))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void getMyProfileImport_returnsSessionWhenItBelongsToCaller() {
        authenticateAs(MEMBER_ID);
        final ProfileImport session = ProfileImport.create("import-1", MEMBER_ID, ProfileImportSource.CV_PDF, Instant.now())
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, Instant.now(), null);
        when(profileImportPort.findById("import-1")).thenReturn(Optional.of(session));

        assertThat(service.getMyProfileImport("import-1")).contains(session);
    }

    @Test
    void getMyProfileImport_returnsEmptyWhenSessionBelongsToAnotherMember() {
        authenticateAs(MEMBER_ID);
        final ProfileImport othersSession = ProfileImport.create(
                "import-1", MemberId.newId(), ProfileImportSource.CV_PDF, Instant.now());
        when(profileImportPort.findById("import-1")).thenReturn(Optional.of(othersSession));

        assertThat(service.getMyProfileImport("import-1")).isEmpty();
    }

    @Test
    void getMyProfileImport_returnsEmptyWhenSessionDoesNotExist() {
        authenticateAs(MEMBER_ID);
        when(profileImportPort.findById("missing")).thenReturn(Optional.empty());

        assertThat(service.getMyProfileImport("missing")).isEmpty();
    }

    private void authenticateAs(final MemberId memberId) {
        when(securityContextPort.currentIdentity())
                .thenReturn(Optional.of(new AuthenticatedIdentity(memberId.toString(), null, null, null, null)));
    }
}
