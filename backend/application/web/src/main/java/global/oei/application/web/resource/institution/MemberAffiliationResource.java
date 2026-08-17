package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberAffiliationApi;
import global.oei.application.web.model.EmploymentAffiliationDTO;
import global.oei.application.web.model.RequestEmploymentAffiliationRequestDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;

/**
 * Implements every operation of {@link MemberAffiliationApi}: no stub left on this interface.
 */
@RestController
@RequiredArgsConstructor
public class MemberAffiliationResource implements MemberAffiliationApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<EmploymentAffiliationDTO>> listMyEmploymentAffiliations() {
        return ResponseEntity.ok(institutionAdapter.listMyEmploymentAffiliations().stream().map(InstitutionDtoMapper::toMemberDto).toList());
    }

    @Override
    public ResponseEntity<EmploymentAffiliationDTO> requestEmploymentAffiliation(final RequestEmploymentAffiliationRequestDTO dto) {
        final var affiliation = institutionAdapter.requestEmploymentAffiliation(dto.getInstitutionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(InstitutionDtoMapper.toMemberDto(affiliation));
    }
}
