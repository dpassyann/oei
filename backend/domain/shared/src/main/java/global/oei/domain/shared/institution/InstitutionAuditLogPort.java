package global.oei.domain.shared.institution;

import java.util.List;

/**
 * Outbound port for {@link InstitutionAuditLog}.
 */
public interface InstitutionAuditLogPort {

    List<InstitutionAuditLog> findByInstitutionId(InstitutionId institutionId);

    List<InstitutionAuditLog> findAll();

    InstitutionAuditLog append(InstitutionAuditLog entry);
}
