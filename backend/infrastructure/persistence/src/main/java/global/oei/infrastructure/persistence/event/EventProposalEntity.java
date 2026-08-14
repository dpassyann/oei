package global.oei.infrastructure.persistence.event;

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
@Table(name = "event_proposal")
public class EventProposalEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "start_at")
    private Instant startAt;

    @Column(name = "end_at")
    private Instant endAt;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "country")
    private String country;

    @Column(name = "city")
    private String city;

    @Column(name = "venue")
    private String venue;

    @Column(name = "online_url")
    private String onlineUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "ai_precheck_passed")
    private Boolean aiPrecheckPassed;

    @Column(name = "ai_precheck_summary")
    private String aiPrecheckSummary;

    @Column(name = "ai_precheck_checked_at")
    private Instant aiPrecheckCheckedAt;

    @Column(name = "moderator_note")
    private String moderatorNote;
}
