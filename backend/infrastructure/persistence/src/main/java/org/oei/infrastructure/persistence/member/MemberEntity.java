package org.oei.infrastructure.persistence.member;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.oei.infrastructure.persistence.audit.BaseAudit;

/**
 * JPA persistence model for a member. Intentionally separate from the domain
 * {@code org.oei.domain.shared.member.Member} record — see {@code MemberPersistenceAdapter}
 * for the mapping at the boundary.
 */
@Entity
@Table(name = "member")
public class MemberEntity extends BaseAudit {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "public_slug", nullable = false, unique = true)
    private String publicSlug;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "locale", nullable = false)
    private String locale;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    protected MemberEntity() {
        // required by JPA
    }

    public MemberEntity(
            final UUID id,
            final String publicSlug,
            final String displayName,
            final String legalName,
            final String locale,
            final String country,
            final Instant registeredAt) {
        this.id = id;
        this.publicSlug = publicSlug;
        this.displayName = displayName;
        this.legalName = legalName;
        this.locale = locale;
        this.country = country;
        this.registeredAt = registeredAt;
    }

    public UUID getId() {
        return id;
    }

    public String getPublicSlug() {
        return publicSlug;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getLegalName() {
        return legalName;
    }

    public String getLocale() {
        return locale;
    }

    public String getCountry() {
        return country;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }
}
