package global.oei.domain.shared.institution;

import java.util.List;

public interface InstitutionAuditLogPort {

    List<InstitutionAuditLog> findByInstitutionId(InstitutionId institutionId);

    List<InstitutionAuditLog> findAll();

    InstitutionAuditLog append(InstitutionAuditLog entry);
}
