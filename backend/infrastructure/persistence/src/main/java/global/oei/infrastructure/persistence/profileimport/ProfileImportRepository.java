package global.oei.infrastructure.persistence.profileimport;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileImportRepository extends JpaRepository<ProfileImportEntity, UUID> {

    Optional<ProfileImportEntity> findFirstByMemberIdOrderByStatusUpdatedAtDesc(UUID memberId);
}
