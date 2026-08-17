package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.InstitutionPublicationsApi;
import global.oei.application.web.model.InstitutionPublicationCreationDTO;
import global.oei.application.web.model.InstitutionPublicationDTO;
import global.oei.application.web.model.InstitutionPublicationTypeDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import global.oei.domain.shared.institution.InstitutionPublicationType;

/**
 * Implements every operation of {@link InstitutionPublicationsApi}: no stub left on this
 * interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionPublicationsResource implements InstitutionPublicationsApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionPublicationDTO>> listInstitutionPublications() {
        return ResponseEntity.ok(institutionAdapter.listPublications().stream().map(InstitutionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<InstitutionPublicationDTO> createInstitutionPublication(final InstitutionPublicationCreationDTO dto) {
        final var publication = institutionAdapter.createPublication(toDomain(dto.getType()), dto.getTitle(), dto.getBody());
        return ResponseEntity.status(HttpStatus.CREATED).body(InstitutionDtoMapper.toDto(publication));
    }

    @Override
    public ResponseEntity<InstitutionPublicationDTO> getInstitutionPublication(final String id) {
        return institutionAdapter.getPublication(id)
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionPublicationDTO> updateInstitutionPublication(final String id, final InstitutionPublicationCreationDTO dto) {
        return institutionAdapter.updatePublication(id, toDomain(dto.getType()), dto.getTitle(), dto.getBody())
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionPublicationDTO> submitInstitutionPublication(final String id) {
        return institutionAdapter.submitPublication(id)
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static InstitutionPublicationType toDomain(final InstitutionPublicationTypeDTO type) {
        return InstitutionPublicationType.valueOf(type.name());
    }
}
