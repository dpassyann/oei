package global.oei.domain.core.profileimport;

import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdvanceProfileImportServiceTest {

    private final ProfileImportPort port = mock(ProfileImportPort.class);
    private final AdvanceProfileImportService service = new AdvanceProfileImportService(port);

    @Test
    void execute_advancesAndPersistsWhenTargetIsReachable() {
        final ProfileImport uploaded = ProfileImport.create(
                "import-1", MemberId.newId(), ProfileImportSource.CV_PDF, Instant.now())
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, Instant.now(), null);
        when(port.findById("import-1")).thenReturn(Optional.of(uploaded));
        when(port.save(any(ProfileImport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        final ProfileImport advanced = service.execute("import-1", ProfileImportStatus.EXTRACTING, null);

        assertThat(advanced.status()).isEqualTo(ProfileImportStatus.EXTRACTING);
    }

    @Test
    void execute_throwsWhenNoSessionExistsForId() {
        when(port.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.execute("missing", ProfileImportStatus.EXTRACTING, null))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void execute_propagatesIllegalTransitionFromTheDomain() {
        final ProfileImport created = ProfileImport.create(
                "import-1", MemberId.newId(), ProfileImportSource.CV_PDF, Instant.now());
        when(port.findById("import-1")).thenReturn(Optional.of(created));

        assertThatThrownBy(() -> service.execute("import-1", ProfileImportStatus.REVIEW_REQUIRED, null))
                .isInstanceOf(IllegalStateException.class);
    }
}
