package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link InstitutionInvitation}.
 */
public interface InstitutionInvitationPort {

    List<InstitutionInvitation> findByInstitutionId(InstitutionId institutionId);

    Optional<InstitutionInvitation> findById(String id);

    InstitutionInvitation save(InstitutionInvitation invitation);
}
