package global.oei.infrastructure.persistence.badge;

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
@Table(name = "badge_award")
public class BadgeAwardEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "badge_id", nullable = false, length = 40)
    private String badgeId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "awarded_at", nullable = false)
    private Instant awardedAt;

    @Column(name = "source", nullable = false, length = 30)
    private String source;

    @Column(name = "awarded_by")
    private String awardedBy;

    @Column(name = "revoked", nullable = false)
    private boolean revoked;
}
