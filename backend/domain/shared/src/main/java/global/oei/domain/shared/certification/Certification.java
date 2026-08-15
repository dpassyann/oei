package global.oei.domain.shared.certification;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A certification declared by a member. Always starts {@link CertificationStatus#DECLARED}
 * (see {@code DeclareCertificationService}) — moving to {@code VALIDATED}/{@code REJECTED}
 * is a separate governance action, out of scope for this iteration (TODO: no catalog-based
 * auto-validation against {@code RecognizedCertification} modeled yet;
 * {@link #recognizedCertificationId()} is carried as an opaque, unvalidated reference).
 */
public record Certification(
        String id,
        MemberId memberId,
        String name,
        String issuingOrganization,
        String recognizedCertificationId,
        LocalDate issuedAt,
        LocalDate expiresAt,
        String proofDocumentUrl,
        CertificationStatus status,
        String validatedBy,
        Instant validatedAt) {

    public Certification {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(issuingOrganization, "issuingOrganization must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * @return a new instance moved to {@link CertificationStatus#VALIDATED} by {@code validatorId}
     */
    public Certification validate(final String validatorId, final Instant now) {
        return new Certification(
                id, memberId, name, issuingOrganization, recognizedCertificationId, issuedAt, expiresAt, proofDocumentUrl,
                CertificationStatus.VALIDATED, validatorId, now);
    }

    /**
     * @return a new instance moved to {@link CertificationStatus#REJECTED} by {@code validatorId}
     */
    public Certification reject(final String validatorId, final Instant now) {
        return new Certification(
                id, memberId, name, issuingOrganization, recognizedCertificationId, issuedAt, expiresAt, proofDocumentUrl,
                CertificationStatus.REJECTED, validatorId, now);
    }
}
