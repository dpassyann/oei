package global.oei.infrastructure.persistence.institution;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
@Table(name = "institution")
public class InstitutionEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "public_name", nullable = false)
    private String publicName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "country", nullable = false)
    private String country;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sectors_json", columnDefinition = "jsonb")
    private String sectorsJson;

    @Column(name = "description")
    private String description;

    @Column(name = "public_slug", nullable = false, unique = true)
    private String publicSlug;

    @Column(name = "is_demo_data", nullable = false)
    private boolean isDemoData;

    @Column(name = "status", nullable = false)
    private String status;
}
