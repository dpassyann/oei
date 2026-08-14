package global.oei.infrastructure.persistence.institution;

import java.time.Instant;
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
@Table(name = "partnership")
public class PartnershipEntity {

    @Id
    @Column(name = "institution_id", nullable = false, updatable = false)
    private UUID institutionId;

    @Column(name = "level", nullable = false)
    private String level;

    @Column(name = "verified", nullable = false)
    private boolean verified;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    @Column(name = "agreement_document_url")
    private String agreementDocumentUrl;
}
