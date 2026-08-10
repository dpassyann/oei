package org.oei.infrastructure.persistence.member;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<MemberEntity, UUID> {

    Optional<MemberEntity> findByPublicSlug(String publicSlug);
}
