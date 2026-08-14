package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionInvitation;
import global.oei.domain.shared.institution.InstitutionInvitationPort;
import global.oei.domain.shared.institution.InstitutionInvitationStatus;
import global.oei.domain.shared.institution.InstitutionRole;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionInvitationPersistenceAdapter implements InstitutionInvitationPort {

    private final InstitutionInvitationRepository repository;

    @Override
    public List<InstitutionInvitation> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionId(institutionId.value()).stream()
                .map(InstitutionInvitationPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<InstitutionInvitation> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(InstitutionInvitationPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public InstitutionInvitation save(final InstitutionInvitation invitation) {
        final InstitutionInvitationEntity entity = new InstitutionInvitationEntity(
                UUID.fromString(invitation.id()), invitation.institutionId().value(), invitation.email(),
                invitation.role().name(), invitation.status().name(), invitation.invitedBy(), invitation.invitedAt(),
                invitation.expiresAt());
        repository.save(entity);
        return invitation;
    }

    private static InstitutionInvitation toDomain(final InstitutionInvitationEntity entity) {
        return new InstitutionInvitation(
                entity.getId().toString(), new InstitutionId(entity.getInstitutionId()), entity.getEmail(),
                InstitutionRole.valueOf(entity.getRole()), InstitutionInvitationStatus.valueOf(entity.getStatus()),
                entity.getInvitedBy(), entity.getInvitedAt(), entity.getExpiresAt());
    }
}
