package global.oei.application.web.resource.institution;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.InstitutionOpportunitiesApi;
import global.oei.application.web.model.InstitutionOpportunityCreationDTO;
import global.oei.application.web.model.InstitutionOpportunityDTO;
import global.oei.application.web.model.InstitutionOpportunityTypeDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import global.oei.domain.shared.institution.InstitutionOpportunityType;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link InstitutionOpportunitiesApi}: no stub left on this
 * interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionOpportunitiesResource implements InstitutionOpportunitiesApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionOpportunityDTO>> listInstitutionOpportunities() {
        return ResponseEntity.ok(institutionAdapter.listOpportunities().stream().map(InstitutionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<InstitutionOpportunityDTO> createInstitutionOpportunity(final InstitutionOpportunityCreationDTO dto) {
        final var opportunity =
                institutionAdapter.createOpportunity(toDomain(dto.getType()), dto.getTitle(), dto.getDescription(), toInstant(dto.getExpiresAt()));
        return ResponseEntity.status(HttpStatus.CREATED).body(InstitutionDtoMapper.toDto(opportunity));
    }

    @Override
    public ResponseEntity<InstitutionOpportunityDTO> updateInstitutionOpportunity(final String id, final InstitutionOpportunityCreationDTO dto) {
        return institutionAdapter
                .updateOpportunity(id, toDomain(dto.getType()), dto.getTitle(), dto.getDescription(), toInstant(dto.getExpiresAt()))
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionOpportunityDTO> closeInstitutionOpportunity(final String id) {
        return institutionAdapter.closeOpportunity(id)
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static InstitutionOpportunityType toDomain(final InstitutionOpportunityTypeDTO type) {
        return InstitutionOpportunityType.valueOf(type.name());
    }

    private static Instant toInstant(final LocalDateTime value) {
        return value == null ? null : value.toInstant(ZoneOffset.UTC);
    }
}
