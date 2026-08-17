package global.oei.application.web.resource.institution;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.InstitutionAccountApi;
import global.oei.application.web.model.InstitutionDTO;
import global.oei.application.web.model.PartnershipDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;

/**
 * Implements every operation of {@link InstitutionAccountApi}: no stub left on this interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionAccountResource implements InstitutionAccountApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<InstitutionDTO> getMyInstitutionAccount() {
        return ResponseEntity.ok(InstitutionDtoMapper.toDto(institutionAdapter.getMyInstitution()));
    }

    @Override
    public ResponseEntity<InstitutionDTO> updateMyInstitutionAccount(final InstitutionDTO institutionDTO) {
        return ResponseEntity.ok(InstitutionDtoMapper.toDto(institutionAdapter.updateMyInstitution(toDomain(institutionDTO))));
    }

    @Override
    public ResponseEntity<PartnershipDTO> getMyPartnership() {
        return institutionAdapter.getMyPartnership()
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static global.oei.domain.shared.institution.Institution toDomain(final InstitutionDTO dto) {
        return new global.oei.domain.shared.institution.Institution(
                global.oei.domain.shared.institution.InstitutionId.of(dto.getId()),
                dto.getLegalName(),
                dto.getPublicName(),
                dto.getLogoUrl() == null ? null : dto.getLogoUrl().toString(),
                dto.getCountry(),
                dto.getSectors(),
                dto.getDescription(),
                java.util.List.of(),
                dto.getPublicSlug(),
                Boolean.TRUE.equals(dto.getIsDemoData()),
                dto.getStatus() == null
                        ? global.oei.domain.shared.institution.InstitutionWorkflowStatus.ACTIVE
                        : global.oei.domain.shared.institution.InstitutionWorkflowStatus.valueOf(dto.getStatus().name()));
    }
}
