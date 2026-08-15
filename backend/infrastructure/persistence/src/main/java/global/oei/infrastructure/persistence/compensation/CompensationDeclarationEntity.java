package global.oei.infrastructure.persistence.compensation;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import global.oei.infrastructure.persistence.config.audit.BaseAudit;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * JPA persistence model for one member's {@code CurrentCompensation} declaration, attached to
 * a Professional Neural Network graph node (domain/topic/certification). Never exposed
 * individually — only ever read back through anonymized aggregates, see
 * {@code SalaryInsightPersistenceAdapter}.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "compensation_declaration")
public class CompensationDeclarationEntity extends BaseAudit {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "node_type", nullable = false, length = 20)
    private String nodeType;

    @Column(name = "node_id", nullable = false)
    private String nodeId;

    @Column(name = "country")
    private String country;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "period", nullable = false, length = 10)
    private String period;
}
