package global.oei.infrastructure.persistence.certification;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "recognized_certification")
public class RecognizedCertificationEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "issuing_organization", nullable = false)
    private String issuingOrganization;

    @Column(name = "catalog_reference")
    private String catalogReference;

    @Column(name = "auto_validate", nullable = false)
    private boolean autoValidate;

    @Column(name = "domain")
    private String domain;

    @Column(name = "level", length = 20)
    private String level;

    @Column(name = "language", length = 10)
    private String language;

    @Column(name = "oei_status", nullable = false, length = 20)
    private String oeiStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "competencies_json", columnDefinition = "jsonb")
    private String competenciesJson;

    @Column(name = "validity_months")
    private Integer validityMonths;

    @Column(name = "associated_path_route")
    private String associatedPathRoute;

    @Column(name = "description")
    private String description;

    @Column(name = "catalog_status", nullable = false, length = 20)
    private String catalogStatus;
}
