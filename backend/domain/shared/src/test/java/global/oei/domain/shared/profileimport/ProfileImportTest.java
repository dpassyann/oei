package global.oei.domain.shared.profileimport;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProfileImportTest {

    private static final Instant T0 = Instant.parse("2026-09-01T10:00:00Z");
    private static final Instant T1 = Instant.parse("2026-09-01T10:05:00Z");

    @Test
    void create_alwaysStartsCreatedWithNoErrorOrLabel() {
        final MemberId memberId = MemberId.newId();
        final ProfileImport session = ProfileImport.create("import-1", memberId, ProfileImportSource.CV_PDF, T0);

        assertThat(session.id()).isEqualTo("import-1");
        assertThat(session.memberId()).isEqualTo(memberId);
        assertThat(session.source()).isEqualTo(ProfileImportSource.CV_PDF);
        assertThat(session.status()).isEqualTo(ProfileImportStatus.CREATED);
        assertThat(session.createdAt()).isEqualTo(T0);
        assertThat(session.updatedAt()).isEqualTo(T0);
        assertThat(session.errorCode()).isNull();
        assertThat(session.processingStepLabel()).isNull();
    }

    @Test
    void transitionTo_advancesStatusAndUpdatedAtWhenReachable() {
        final ProfileImport session = created().transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, T1, null);

        assertThat(session.status()).isEqualTo(ProfileImportStatus.DOCUMENT_UPLOADED);
        assertThat(session.updatedAt()).isEqualTo(T1);
        assertThat(session.createdAt()).isEqualTo(T0);
    }

    @Test
    void transitionTo_throwsWhenTargetIsNotReachableFromCurrentStatus() {
        final ProfileImport session = created();

        assertThatThrownBy(() -> session.transitionTo(ProfileImportStatus.REVIEW_REQUIRED, T1, null))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void transitionTo_throwsWhenCurrentStatusIsAlreadyTerminal() {
        final ProfileImport failed = created().transitionTo(ProfileImportStatus.FAILED, T1, "UPLOAD_REJECTED");

        assertThatThrownBy(() -> failed.transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, T1, null))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void transitionTo_setsErrorCodeOnlyWhenTargetIsFailed() {
        final ProfileImport failed = created().transitionTo(ProfileImportStatus.FAILED, T1, "UPLOAD_REJECTED");

        assertThat(failed.errorCode()).isEqualTo("UPLOAD_REJECTED");
    }

    @Test
    void transitionTo_leavesErrorCodeUnchangedWhenTargetIsNotFailed() {
        final ProfileImport uploaded = created().transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, T1, "ignored");

        assertThat(uploaded.errorCode()).isNull();
    }

    @Test
    void transitionTo_toExpiredIsAllowedBeforeConfirmation() {
        final ProfileImport reviewRequired = created()
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, T1, null)
                .transitionTo(ProfileImportStatus.EXTRACTING, T1, null)
                .transitionTo(ProfileImportStatus.AI_PROCESSING, T1, null)
                .transitionTo(ProfileImportStatus.REVIEW_REQUIRED, T1, null);

        final ProfileImport expired = reviewRequired.transitionTo(ProfileImportStatus.EXPIRED, T1, null);

        assertThat(expired.status()).isEqualTo(ProfileImportStatus.EXPIRED);
    }

    @Test
    void transitionTo_toExpiredIsRejectedAfterConfirmation() {
        final ProfileImport confirmed = created()
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, T1, null)
                .transitionTo(ProfileImportStatus.EXTRACTING, T1, null)
                .transitionTo(ProfileImportStatus.AI_PROCESSING, T1, null)
                .transitionTo(ProfileImportStatus.REVIEW_REQUIRED, T1, null)
                .transitionTo(ProfileImportStatus.CONFIRMED, T1, null);

        assertThatThrownBy(() -> confirmed.transitionTo(ProfileImportStatus.EXPIRED, T1, null))
                .isInstanceOf(IllegalStateException.class);
    }

    private static ProfileImport created() {
        return ProfileImport.create("import-1", MemberId.newId(), ProfileImportSource.CV_PDF, T0);
    }
}
