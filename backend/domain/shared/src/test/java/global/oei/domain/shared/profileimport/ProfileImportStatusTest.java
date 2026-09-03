package global.oei.domain.shared.profileimport;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileImportStatusTest {

    @Test
    void created_isNeverReachableFromAnyStatus() {
        for (final ProfileImportStatus from : ProfileImportStatus.values()) {
            assertThat(ProfileImportStatus.CREATED.isReachableFrom(from)).isFalse();
        }
    }

    @Test
    void documentUploaded_isReachableOnlyFromCreated() {
        assertThat(ProfileImportStatus.DOCUMENT_UPLOADED.isReachableFrom(ProfileImportStatus.CREATED)).isTrue();
        assertThat(ProfileImportStatus.DOCUMENT_UPLOADED.isReachableFrom(ProfileImportStatus.EXTRACTING)).isFalse();
    }

    @Test
    void happyPathChain_isFullyReachableInOrder() {
        assertThat(ProfileImportStatus.EXTRACTING.isReachableFrom(ProfileImportStatus.DOCUMENT_UPLOADED)).isTrue();
        assertThat(ProfileImportStatus.AI_PROCESSING.isReachableFrom(ProfileImportStatus.EXTRACTING)).isTrue();
        assertThat(ProfileImportStatus.REVIEW_REQUIRED.isReachableFrom(ProfileImportStatus.AI_PROCESSING)).isTrue();
        assertThat(ProfileImportStatus.CONFIRMED.isReachableFrom(ProfileImportStatus.REVIEW_REQUIRED)).isTrue();
        assertThat(ProfileImportStatus.COMPLETED.isReachableFrom(ProfileImportStatus.CONFIRMED)).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = ProfileImportStatus.class,
            names = {"CREATED", "DOCUMENT_UPLOADED", "EXTRACTING", "AI_PROCESSING", "REVIEW_REQUIRED", "CONFIRMED"})
    void failed_isReachableFromEveryNonTerminalStatus(final ProfileImportStatus from) {
        assertThat(ProfileImportStatus.FAILED.isReachableFrom(from)).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = ProfileImportStatus.class, names = {"COMPLETED", "FAILED", "EXPIRED"})
    void failed_isNeverReachableFromTerminalStatus(final ProfileImportStatus from) {
        assertThat(ProfileImportStatus.FAILED.isReachableFrom(from)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = ProfileImportStatus.class,
            names = {"CREATED", "DOCUMENT_UPLOADED", "EXTRACTING", "AI_PROCESSING", "REVIEW_REQUIRED"})
    void expired_isReachableFromEveryNonTerminalStatusExceptConfirmed(final ProfileImportStatus from) {
        assertThat(ProfileImportStatus.EXPIRED.isReachableFrom(from)).isTrue();
    }

    @Test
    void expired_isNotReachableFromConfirmed() {
        assertThat(ProfileImportStatus.EXPIRED.isReachableFrom(ProfileImportStatus.CONFIRMED)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = ProfileImportStatus.class, names = {"COMPLETED", "FAILED", "EXPIRED"})
    void isTerminal_isTrueForCompletedFailedAndExpired(final ProfileImportStatus status) {
        assertThat(status.isTerminal()).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = ProfileImportStatus.class,
            names = {"CREATED", "DOCUMENT_UPLOADED", "EXTRACTING", "AI_PROCESSING", "REVIEW_REQUIRED", "CONFIRMED"})
    void isTerminal_isFalseForEveryOtherStatus(final ProfileImportStatus status) {
        assertThat(status.isTerminal()).isFalse();
    }
}
