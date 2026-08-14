package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.InstitutionAuditApi;
import global.oei.application.web.model.InstitutionAuditLogDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class InstitutionAuditResource implements InstitutionAuditApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionAuditLogDTO>> listInstitutionAuditLog() {
        return ResponseEntity.ok(institutionAdapter.listAuditLog().stream().map(InstitutionDtoMapper::toDto).toList());
    }
}
