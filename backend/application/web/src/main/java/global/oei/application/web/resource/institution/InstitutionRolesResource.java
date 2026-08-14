package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.InstitutionRolesApi;
import global.oei.application.web.model.InstitutionMembershipDTO;
import global.oei.application.web.model.UpdateInstitutionRoleAssignmentRequestDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import global.oei.domain.shared.institution.InstitutionRole;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link InstitutionRolesApi}: no stub left on this interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionRolesResource implements InstitutionRolesApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionMembershipDTO>> listInstitutionRoleAssignments() {
        return ResponseEntity.ok(institutionAdapter.listRoleAssignments().stream().map(InstitutionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<InstitutionMembershipDTO> updateInstitutionRoleAssignment(
            final String memberId, final UpdateInstitutionRoleAssignmentRequestDTO updateInstitutionRoleAssignmentRequestDTO) {
        return institutionAdapter
                .updateRoleAssignment(memberId, InstitutionRole.valueOf(updateInstitutionRoleAssignmentRequestDTO.getRole().name()))
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> removeInstitutionRoleAssignment(final String memberId) {
        institutionAdapter.removeRoleAssignment(memberId);
        return ResponseEntity.noContent().build();
    }
}
