package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.InstitutionAffiliationsApi;
import global.oei.application.web.model.MemberInstitutionAffiliationDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;

/**
 * Implements every operation of {@link InstitutionAffiliationsApi}: no stub left on this
 * interface.
 */
@RestController
@RequiredArgsConstructor
public class InstitutionAffiliationsResource implements InstitutionAffiliationsApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<MemberInstitutionAffiliationDTO>> listInstitutionMembers() {
        return ResponseEntity.ok(institutionAdapter.listAcceptedAffiliations().stream().map(InstitutionDtoMapper::toInstitutionDto).toList());
    }

    @Override
    public ResponseEntity<List<MemberInstitutionAffiliationDTO>> listInstitutionAffiliationRequests() {
        return ResponseEntity.ok(institutionAdapter.listAffiliationRequests().stream().map(InstitutionDtoMapper::toInstitutionDto).toList());
    }

    @Override
    public ResponseEntity<MemberInstitutionAffiliationDTO> approveInstitutionAffiliation(final String id) {
        return institutionAdapter.approveAffiliation(id)
                .map(InstitutionDtoMapper::toInstitutionDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<MemberInstitutionAffiliationDTO> rejectInstitutionAffiliation(final String id) {
        return institutionAdapter.rejectAffiliation(id)
                .map(InstitutionDtoMapper::toInstitutionDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> endInstitutionAffiliation(final String id) {
        return institutionAdapter.endAffiliation(id)
                .map(affiliation -> ResponseEntity.noContent().<Void>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
