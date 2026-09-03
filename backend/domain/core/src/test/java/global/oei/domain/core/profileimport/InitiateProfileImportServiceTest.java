package global.oei.domain.core.profileimport;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InitiateProfileImportServiceTest {

    private final ProfileImportPort port = mock(ProfileImportPort.class);
    private final InitiateProfileImportService service = new InitiateProfileImportService(port);

    @Test
    void execute_createsAndPersistsASessionAlreadyAtDocumentUploaded() {
        final MemberId memberId = MemberId.newId();
        when(port.save(any(ProfileImport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        final ProfileImport session = service.execute(memberId, ProfileImportSource.CV_PDF);

        assertThat(session.memberId()).isEqualTo(memberId);
        assertThat(session.source()).isEqualTo(ProfileImportSource.CV_PDF);
        assertThat(session.status()).isEqualTo(ProfileImportStatus.DOCUMENT_UPLOADED);
        assertThat(session.id()).isNotBlank();
        verify(port).save(session);
    }

    @Test
    void execute_generatesADifferentIdOnEachCall() {
        when(port.save(any(ProfileImport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        final ProfileImport first = service.execute(MemberId.newId(), ProfileImportSource.CV_PDF);
        final ProfileImport second = service.execute(MemberId.newId(), ProfileImportSource.CV_DOCX);

        assertThat(first.id()).isNotEqualTo(second.id());
    }
}
