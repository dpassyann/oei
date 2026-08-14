package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.InstitutionInvitationsApi;
import global.oei.application.web.model.InstitutionInvitationCreationDTO;
import global.oei.application.web.model.InstitutionInvitationDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import global.oei.domain.shared.institution.InstitutionRole;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link InstitutionInvitationsApi}: no stub left on this
 * interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionInvitationsResource implements InstitutionInvitationsApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionInvitationDTO>> listInstitutionInvitations() {
        return ResponseEntity.ok(institutionAdapter.listInvitations().stream().map(InstitutionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<InstitutionInvitationDTO> createInstitutionInvitation(final InstitutionInvitationCreationDTO institutionInvitationCreationDTO) {
        final var invitation = institutionAdapter.createInvitation(
                institutionInvitationCreationDTO.getEmail(),
                InstitutionRole.valueOf(institutionInvitationCreationDTO.getRole().name()));
        return ResponseEntity.status(HttpStatus.CREATED).body(InstitutionDtoMapper.toDto(invitation));
    }

    @Override
    public ResponseEntity<InstitutionInvitationDTO> revokeInstitutionInvitation(final String id) {
        return institutionAdapter.revokeInvitation(id)
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
