package org.oei.infrastructure.persistence.membership;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.oei.infrastructure.persistence.audit.BaseAudit;

/**
 * JPA persistence model for a membership. Intentionally separate from the domain
 * {@code org.oei.domain.shared.membership.Membership} record — see
 * {@code MembershipPersistenceAdapter} for the mapping at the boundary.
 *
 * <p>{@code tier}/{@code status} are persisted as {@code STRING} enums rather than ordinal
 * to stay stable across enum reordering.</p>
 */
@Entity
@Table(name = "membership")
public class MembershipEntity extends BaseAudit {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false, unique = true)
    private UUID memberId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false, length = 40)
    private String tier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "renewed_at")
    private Instant renewedAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    protected MembershipEntity() {
        // required by JPA
    }

    public MembershipEntity(
            final UUID id,
            final UUID memberId,
            final String tier,
            final String status,
            final Instant startedAt,
            final Instant renewedAt,
            final Instant endsAt) {
        this.id = id;
        this.memberId = memberId;
        this.tier = tier;
        this.status = status;
        this.startedAt = startedAt;
        this.renewedAt = renewedAt;
        this.endsAt = endsAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getMemberId() {
        return memberId;
    }

    public String getTier() {
        return tier;
    }

    public String getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getRenewedAt() {
        return renewedAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }
}
