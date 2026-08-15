package global.oei.infrastructure.persistence.publicprofile;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicProfileRepository extends JpaRepository<PublicProfileEntity, UUID> {

    Optional<PublicProfileEntity> findByMemberId(UUID memberId);
}
