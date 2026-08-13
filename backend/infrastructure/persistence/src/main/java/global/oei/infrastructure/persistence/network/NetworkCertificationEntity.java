package global.oei.infrastructure.persistence.network;

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
@Table(name = "network_certification")
public class NetworkCertificationEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 60)
    private String id;

    @Column(name = "topic_id", nullable = false, length = 40)
    private String topicId;

    @Column(name = "domain_id", nullable = false, length = 40)
    private String domainId;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "prereq_certification_id", length = 60)
    private String prereqCertificationId;

    @Column(name = "description")
    private String description;

    @Column(name = "validated_skills")
    private String validatedSkills;

    @Column(name = "validity_period")
    private String validityPeriod;

    @Column(name = "expert_count", nullable = false)
    private int expertCount;

    @Column(name = "x", nullable = false)
    private double x;

    @Column(name = "y", nullable = false)
    private double y;
}
