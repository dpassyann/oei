package global.oei.domain.shared.profileimport;

/**
 * Lifecycle of a {@link ProfileImport} pipeline session, mirrored one-to-one on the OEI
 * OpenAPI contract ({@code ProfileImportStatus} enum).
 *
 * <p><strong>Deliberately distinct from {@link global.oei.domain.shared.cv.CvStatus}</strong>:
 * {@code CvStatus} (DRAFT/READY) models the content-editing lifecycle of a {@code Cv} document
 * a member builds by hand; this enum models the orthogonal "Smart CV Import" pipeline —
 * upload a document, extract its text, let AI structure it into a draft
 * {@link global.oei.domain.shared.profile.ProfessionalProfile}, let the member review/correct
 * it, then confirm. A member can go through this pipeline without ever touching a
 * {@code Cv}, and vice versa.</p>
 *
 * <p>Each constant knows which predecessor statuses it may legally be reached from — see
 * {@link #isReachableFrom(ProfileImportStatus)} — so {@link ProfileImport#transitionTo} can
 * enforce the pipeline's state machine without an external switch/if-else ladder (Yann's enum
 * strategy pattern). {@link #EXTRACTING} and {@link #AI_PROCESSING} are reachable today only
 * through the internal/test-only seam ({@code AdvanceProfileImportUseCase}) documented on that
 * interface: the real text-extraction and Bedrock/Textract AI steps are not implemented yet
 * (blocked on infrastructure not yet provisioned).</p>
 */
public enum ProfileImportStatus {

    /**
     * Session just created, before any document has been received. Only reachable through
     * {@link ProfileImport#create}, never through {@link ProfileImport#transitionTo}.
     */
    CREATED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return false;
        }
    },

    /**
     * The source document (CV PDF/DOCX) has been received and stored.
     */
    DOCUMENT_UPLOADED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return from == CREATED;
        }
    },

    /**
     * Text is being extracted from the uploaded document. Seam: not yet driven by a real
     * extraction adapter.
     */
    EXTRACTING {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return from == DOCUMENT_UPLOADED;
        }
    },

    /**
     * Extracted text is being structured into a draft profile by the AI pipeline. Seam: not
     * yet driven by a real Bedrock/Textract adapter.
     */
    AI_PROCESSING {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return from == EXTRACTING;
        }
    },

    /**
     * The AI-extracted draft is available and awaiting member review/correction
     * ({@code GET}/{@code PUT .../draft}).
     */
    REVIEW_REQUIRED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return from == AI_PROCESSING;
        }
    },

    /**
     * The member confirmed the (possibly corrected) draft; the profile is about to be
     * created/updated from it.
     */
    CONFIRMED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return from == REVIEW_REQUIRED;
        }
    },

    /**
     * Terminal success: the profile has been created/updated from the confirmed draft.
     */
    COMPLETED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return from == CONFIRMED;
        }
    },

    /**
     * Terminal failure, reachable from any non-terminal status (upload rejected, extraction
     * error, AI failure, …). {@link ProfileImport#errorCode()} carries the technical reason.
     */
    FAILED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return !from.isTerminal();
        }
    },

    /**
     * Terminal abandonment: the session was left inactive too long before the member
     * confirmed. Not reachable once {@link #CONFIRMED} (confirmation already committed to
     * creating/updating the profile).
     */
    EXPIRED {
        @Override
        public boolean isReachableFrom(final ProfileImportStatus from) {
            return !from.isTerminal() && from != CONFIRMED;
        }
    };

    /**
     * @return whether a {@link ProfileImport} currently in status {@code from} may legally
     *         transition to this constant via {@link ProfileImport#transitionTo}
     */
    public abstract boolean isReachableFrom(ProfileImportStatus from);

    /**
     * @return whether this status is final — no further transition is ever legal once reached
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == EXPIRED;
    }
}
