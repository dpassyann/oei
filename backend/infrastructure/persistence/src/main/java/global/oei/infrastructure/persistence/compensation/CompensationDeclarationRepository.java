package global.oei.infrastructure.persistence.compensation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CompensationDeclarationRepository extends JpaRepository<CompensationDeclarationEntity, UUID> {

    @Query(
            """
            SELECT MIN(c.amount) AS low, MAX(c.amount) AS high, COUNT(c) AS sampleSize,
                   MAX(c.currency) AS currency, MAX(c.period) AS period
            FROM CompensationDeclarationEntity c
            WHERE c.nodeType = :nodeType AND c.nodeId = :nodeId
              AND (:country IS NULL OR c.country = :country)
            """)
    SalaryAggregateProjection aggregate(
            @Param("nodeType") String nodeType, @Param("nodeId") String nodeId, @Param("country") String country);
}
