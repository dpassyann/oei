package global.oei.infrastructure.persistence.membership;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import global.oei.infrastructure.persistence.config.audit.BaseAudit;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * JPA persistence model for a membership. Intentionally separate from the domain
 * {@code global.oei.domain.shared.membership.Membership} record — see
 * {@code MembershipPersistenceAdapter} for the mapping at the boundary.
 *
 * <p>{@code tier}/{@code status} are persisted as {@code STRING} enums rather than ordinal
 * to stay stable across enum reordering.</p>
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "membership")
public class MembershipEntity extends BaseAudit {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false, unique = true)
    private UUID memberId;

    @Column(name = "tier", nullable = false, length = 40)
    private String tier;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "renewed_at")
    private Instant renewedAt;

    @Column(name = "ends_at")
    private Instant endsAt;
}
