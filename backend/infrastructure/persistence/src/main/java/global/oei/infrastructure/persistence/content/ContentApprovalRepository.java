package global.oei.infrastructure.persistence.content;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentApprovalRepository extends JpaRepository<ContentApprovalEntity, UUID> {
}
