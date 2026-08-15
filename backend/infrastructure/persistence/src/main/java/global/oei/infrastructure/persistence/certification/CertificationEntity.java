package global.oei.infrastructure.persistence.certification;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "certification")
public class CertificationEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "issuing_organization", nullable = false)
    private String issuingOrganization;

    @Column(name = "recognized_certification_id")
    private String recognizedCertificationId;

    @Column(name = "issued_at")
    private LocalDate issuedAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(name = "proof_document_url")
    private String proofDocumentUrl;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "validated_by")
    private String validatedBy;

    @Column(name = "validated_at")
    private Instant validatedAt;
}
