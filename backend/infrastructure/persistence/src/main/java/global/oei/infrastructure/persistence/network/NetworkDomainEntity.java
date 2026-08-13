package global.oei.infrastructure.persistence.network;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * JPA persistence model for one Professional Neural Network "galaxy view" domain.
 * {@code neighborDomainIds} is stored as a comma-separated column: a plain list of opaque
 * ids, not worth a child table or JSON for this iteration.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "network_domain")
public class NetworkDomainEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 40)
    private String id;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "x", nullable = false)
    private double x;

    @Column(name = "y", nullable = false)
    private double y;

    @Column(name = "neighbor_domain_ids")
    private String neighborDomainIds;
}
