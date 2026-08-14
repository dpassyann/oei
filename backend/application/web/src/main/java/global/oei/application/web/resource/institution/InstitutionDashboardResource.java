package global.oei.application.web.resource.institution;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.InstitutionDashboardApi;
import global.oei.application.web.model.InstitutionDashboardDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class InstitutionDashboardResource implements InstitutionDashboardApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<InstitutionDashboardDTO> getInstitutionDashboard() {
        return ResponseEntity.ok(InstitutionDtoMapper.toDto(institutionAdapter.getDashboard()));
    }
}
