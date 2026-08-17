package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionMembership;
import global.oei.domain.shared.institution.InstitutionMembershipPort;
import global.oei.domain.shared.institution.InstitutionRole;
import global.oei.domain.shared.member.MemberId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionMembershipPersistenceAdapter implements InstitutionMembershipPort {

    private final InstitutionMembershipRepository repository;

    @Override
    public List<InstitutionMembership> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionId(institutionId.value()).stream()
                .map(InstitutionMembershipPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<InstitutionMembership> findByInstitutionIdAndMemberId(final InstitutionId institutionId, final MemberId memberId) {
        return repository.findByInstitutionIdAndMemberId(institutionId.value(), memberId.value())
                .map(InstitutionMembershipPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public InstitutionMembership save(final InstitutionMembership membership) {
        final InstitutionMembershipEntity entity = new InstitutionMembershipEntity(
                membership.memberId().value(), membership.institutionId().value(), membership.role().name(),
                membership.grantedAt(), membership.grantedBy());
        repository.save(entity);
        return membership;
    }

    @Override
    @Transactional
    public void delete(final InstitutionId institutionId, final MemberId memberId) {
        repository.deleteByInstitutionIdAndMemberId(institutionId.value(), memberId.value());
    }

    private static InstitutionMembership toDomain(final InstitutionMembershipEntity entity) {
        return new InstitutionMembership(
                new MemberId(entity.getMemberId()), new InstitutionId(entity.getInstitutionId()),
                InstitutionRole.valueOf(entity.getRole()), entity.getGrantedAt(), entity.getGrantedBy());
    }
}
