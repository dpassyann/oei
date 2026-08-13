package global.oei.infrastructure.persistence.profile;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import global.oei.infrastructure.persistence.config.audit.BaseAudit;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * JPA persistence model for a member's {@code ProfessionalProfile}.
 *
 * <p>Stored as a single {@code jsonb} blob ({@link #profileJson}) rather than exploded into
 * child tables for every nested collection (languages, experiences, educations, skills):
 * the profile is a deliberate "big object", always read/replaced wholesale (see
 * {@code global.oei.domain.shared.profile.ProfessionalProfile}'s Javadoc, ADR 0002), so a
 * relational per-field/per-row model would add mapping ceremony without a real query need —
 * nothing ever queries "find members with skill X" in this iteration. {@link #completenessScore}
 * is denormalized as its own column purely so it stays cheaply queryable/indexable later
 * without parsing the JSON, even though it is also present inside it.</p>
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "professional_profile")
public class ProfessionalProfileEntity extends BaseAudit {

    @Id
    @Column(name = "member_id", nullable = false, updatable = false)
    private UUID memberId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "profile_json", nullable = false, columnDefinition = "jsonb")
    private String profileJson;

    @Column(name = "completeness_score", nullable = false)
    private int completenessScore;
}
