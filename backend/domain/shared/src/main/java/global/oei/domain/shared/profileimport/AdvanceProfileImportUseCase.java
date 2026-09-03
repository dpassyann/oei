package global.oei.domain.shared.profileimport;

/**
 * Seam for driving a {@link ProfileImport} through its pipeline statuses from outside the
 * upload request itself.
 *
 * <p>The real drivers of {@link ProfileImportStatus#EXTRACTING},
 * {@link ProfileImportStatus#AI_PROCESSING} and {@link ProfileImportStatus#REVIEW_REQUIRED}
 * are, respectively, a text-extraction adapter and a Bedrock/Textract AI adapter — neither is
 * implemented yet (blocked on infrastructure not yet provisioned; out of scope for the status
 * machine track). Until that AI work lands, this use case is the only way to move a session
 * past {@link ProfileImportStatus#DOCUMENT_UPLOADED}, and is expected to be called from
 * internal/test-only tooling rather than a public HTTP endpoint.</p>
 *
 * <p>When the AI pipeline is implemented, the future extraction/AI adapters should call this
 * same use case (or be wired in its place) rather than reimplementing the state machine —
 * all transition legality lives in {@link ProfileImport#transitionTo}.</p>
 */
public interface AdvanceProfileImportUseCase {

    /**
     * @param errorCode only used when {@code targetStatus} is {@link ProfileImportStatus#FAILED};
     *                   ignored otherwise
     * @throws java.util.NoSuchElementException if no session exists for {@code importId}
     * @throws IllegalStateException if {@code targetStatus} is not legally reachable from the
     *         session's current status
     */
    ProfileImport execute(String importId, ProfileImportStatus targetStatus, String errorCode);
}
