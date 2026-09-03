package global.oei.domain.shared.profileimport;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A single run of the "Smart CV Import" pipeline for one member: upload a document, extract
 * its text, let AI structure a draft {@link global.oei.domain.shared.profile.ProfessionalProfile},
 * let the member review/correct it, then confirm.
 *
 * <p>This session/pipeline concept is orthogonal to {@link global.oei.domain.shared.cv.Cv}'s
 * {@code CvStatus} (content-editing of a hand-built CV document) — see
 * {@link ProfileImportStatus}'s Javadoc for the full rationale.</p>
 *
 * <p>This track (status machine + plumbing only) does not implement the actual text
 * extraction or AI structuring step: {@link #transitionTo} enforces which status changes are
 * legal, but nothing in this module drives a {@link ProfileImport} through
 * {@link ProfileImportStatus#EXTRACTING}/{@link ProfileImportStatus#AI_PROCESSING} on its own.
 * That is deliberately left as a seam for the future AI extraction work — see
 * {@code AdvanceProfileImportUseCase}.</p>
 */
public record ProfileImport(
        String id,
        MemberId memberId,
        ProfileImportSource source,
        ProfileImportStatus status,
        Instant createdAt,
        Instant updatedAt,
        String errorCode,
        String processingStepLabel) {

    public ProfileImport {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(source, "source must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
        Objects.requireNonNull(updatedAt, "updatedAt must not be null");
    }

    /**
     * Creates a brand-new session, always starting {@link ProfileImportStatus#CREATED} with
     * no error/label, regardless of what a caller might otherwise want to set — mirrors
     * {@code CreateCvService}'s "always starts blank" posture for {@code Cv}.
     *
     * <p>{@link #processingStepLabel()} is deliberately left {@code null} here and by every
     * {@link #transitionTo} call: it is user-facing text, and per the platform's i18n rule
     * such text must come from the frontend's own localized labels (see
     * {@code PROCESSING_STEP_LABELS} in the frontend {@code ProfileImport} domain model) or a
     * localized content API — never hardcoded server-side.</p>
     */
    public static ProfileImport create(
            final String id, final MemberId memberId, final ProfileImportSource source, final Instant now) {
        return new ProfileImport(id, memberId, source, ProfileImportStatus.CREATED, now, now, null, null);
    }

    /**
     * @return a new instance with {@link #status()} advanced to {@code target}, and
     *         {@link #updatedAt()} set to {@code at}; {@link #errorCode()} is set to
     *         {@code errorCode} only when {@code target} is {@link ProfileImportStatus#FAILED},
     *         otherwise left unchanged
     * @throws IllegalStateException if this session is already {@link ProfileImportStatus#isTerminal()}
     *         terminal}, or if {@code target} is not {@link ProfileImportStatus#isReachableFrom}
     *         reachable} from the current {@link #status()}
     */
    public ProfileImport transitionTo(final ProfileImportStatus target, final Instant at, final String errorCode) {
        Objects.requireNonNull(target, "target must not be null");
        Objects.requireNonNull(at, "at must not be null");
        if (status.isTerminal()) {
            throw new IllegalStateException(
                    "Cannot transition ProfileImport " + id + ": status " + status + " is terminal");
        }
        if (!target.isReachableFrom(status)) {
            throw new IllegalStateException(
                    "Cannot transition ProfileImport " + id + " from " + status + " to " + target);
        }
        return new ProfileImport(
                id, memberId, source, target, createdAt, at,
                target == ProfileImportStatus.FAILED ? errorCode : this.errorCode,
                processingStepLabel);
    }
}
