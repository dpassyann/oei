package global.oei.application.web.resource.institution;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.AdminInstitutionsApi;
import global.oei.application.web.model.InstitutionAdminCreationDTO;
import global.oei.application.web.model.InstitutionDTO;
import global.oei.application.web.model.InstitutionRevocationDTO;
import global.oei.application.web.model.PartnershipDTO;
import global.oei.application.web.model.SuspendInstitutionRequestDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import global.oei.domain.shared.institution.PartnershipLevel;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link AdminInstitutionsApi}: no stub left on this
 * interface. {@code activateInstitution} only represents the state transition — see that
 * operation's own contract summary: no real Keycloak provisioning call exists yet.
 */
@RestController
@RequiredArgsConstructor
public class AdminInstitutionsResource implements AdminInstitutionsApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionDTO>> listAdminInstitutions() {
        return ResponseEntity.ok(institutionAdapter.listAllInstitutions().stream().map(InstitutionDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<InstitutionDTO> createAdminInstitution(final InstitutionAdminCreationDTO dto) {
        final var institution = institutionAdapter.createInstitution(
                dto.getLegalName(), dto.getPublicName(), dto.getCountry(), dto.getWebsite() == null ? null : dto.getWebsite().toString(),
                dto.getDescription(), dto.getEmailDomains());
        return ResponseEntity.status(HttpStatus.CREATED).body(InstitutionDtoMapper.toDto(institution));
    }

    @Override
    public ResponseEntity<InstitutionDTO> approveInstitution(final String id) {
        return institutionAdapter.approveInstitution(id).map(InstitutionDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionDTO> activateInstitution(final String id) {
        return institutionAdapter.activateInstitution(id).map(InstitutionDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionDTO> suspendInstitution(final String id, final SuspendInstitutionRequestDTO suspendInstitutionRequestDTO) {
        return institutionAdapter.suspendInstitution(id).map(InstitutionDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionDTO> revokeInstitution(final String id, final InstitutionRevocationDTO institutionRevocationDTO) {
        return institutionAdapter.revokeInstitution(id, institutionRevocationDTO.getReason()).map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<InstitutionDTO> verifyInstitution(final String id) {
        return institutionAdapter.verifyInstitution(id).map(InstitutionDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<PartnershipDTO> updateInstitutionPartnership(final String id, final PartnershipDTO partnershipDTO) {
        return institutionAdapter
                .updatePartnership(
                        id, PartnershipLevel.valueOf(partnershipDTO.getLevel().name()), Boolean.TRUE.equals(partnershipDTO.getVerified()),
                        toInstant(partnershipDTO.getStartedAt()),
                        partnershipDTO.getEndsAt() == null ? null : toInstant(partnershipDTO.getEndsAt().orElse(null)),
                        partnershipDTO.getAgreementDocumentUrl() == null ? null : partnershipDTO.getAgreementDocumentUrl().toString())
                .map(InstitutionDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static java.time.Instant toInstant(final LocalDateTime value) {
        return value == null ? null : value.toInstant(ZoneOffset.UTC);
    }
}
