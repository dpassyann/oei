package global.oei.infrastructure.persistence.book;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookCompilationRepository extends JpaRepository<BookCompilationEntity, UUID> {
}
