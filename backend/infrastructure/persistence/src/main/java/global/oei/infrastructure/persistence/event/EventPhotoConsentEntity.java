package global.oei.infrastructure.persistence.event;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "event_photo_consent")
@IdClass(EventPhotoConsentId.class)
public class EventPhotoConsentEntity {

    @Id
    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Id
    @Column(name = "member_id", nullable = false, updatable = false)
    private UUID memberId;

    @Column(name = "consented_at", nullable = false)
    private Instant consentedAt;
}
