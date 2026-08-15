package global.oei.infrastructure.persistence.publicprofile;

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
 * Persisted only once a member has published at least once (see
 * {@code PublicProfilePersistenceAdapter}, which synthesizes an unpublished default when no row
 * exists yet). {@link #visibleFields()} is stored as a comma-separated list rather than a
 * dedicated element-collection table — a deliberate simplification given the small, fixed set
 * of visible field names in play; revisit with a proper join table if that set ever needs
 * richer querying.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "public_profile")
public class PublicProfileEntity {

    @Id
    @Column(name = "member_id", nullable = false, updatable = false)
    private UUID memberId;

    @Column(name = "public_slug", nullable = false, unique = true)
    private String publicSlug;

    @Column(name = "visible_fields", nullable = false)
    private String visibleFields;

    @Column(name = "seo_description")
    private String seoDescription;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "views_count", nullable = false)
    private int viewsCount;
}
