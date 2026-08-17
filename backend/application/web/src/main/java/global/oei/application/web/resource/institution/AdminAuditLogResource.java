package global.oei.application.web.resource.institution;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminAuditApi;
import global.oei.application.web.model.InstitutionAuditLogDTO;
import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.application.web.resource.institution.mapper.InstitutionDtoMapper;

@RestController
@RequiredArgsConstructor
public class AdminAuditLogResource implements AdminAuditApi {

    private final InstitutionAdapter institutionAdapter;

    @Override
    public ResponseEntity<List<InstitutionAuditLogDTO>> listAdminAuditLog() {
        return ResponseEntity.ok(institutionAdapter.listAllAuditLog().stream().map(InstitutionDtoMapper::toDto).toList());
    }
}
