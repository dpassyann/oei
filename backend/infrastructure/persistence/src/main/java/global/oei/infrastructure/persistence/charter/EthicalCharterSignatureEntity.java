package global.oei.infrastructure.persistence.charter;

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

/**
 * JPA persistence model for one ethical charter signature. Append-only: a member may sign
 * successive charter versions over time, each a separate row.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "ethical_charter_signature")
public class EthicalCharterSignatureEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "version", nullable = false, length = 20)
    private String version;

    @Column(name = "signed_at", nullable = false)
    private Instant signedAt;
}
