package global.oei.infrastructure.persistence.profile;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfileEntity, UUID> {
}
