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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "event")
public class EventEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "location_country", nullable = false)
    private String locationCountry;

    @Column(name = "location_city")
    private String locationCity;

    @Column(name = "location_venue")
    private String locationVenue;

    @Column(name = "location_online_url")
    private String locationOnlineUrl;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(name = "timezone", nullable = false)
    private String timezone;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "registrations_count", nullable = false)
    private int registrationsCount;

    @Column(name = "visibility", nullable = false)
    private String visibility;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "organizers_json", columnDefinition = "jsonb")
    private String organizersJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "languages_json", columnDefinition = "jsonb")
    private String languagesJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "speakers_json", columnDefinition = "jsonb")
    private String speakersJson;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "comments_open_at")
    private Instant commentsOpenAt;

    @Column(name = "comments_closed_at")
    private Instant commentsClosedAt;

    @Column(name = "summary")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "gallery_image_urls_json", columnDefinition = "jsonb")
    private String galleryImageUrlsJson;
}
