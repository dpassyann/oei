package global.oei.domain.core.institution;

import java.util.UUID;

import global.oei.domain.shared.institution.CreateInstitutionPublicationUseCase;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionPublication;
import global.oei.domain.shared.institution.InstitutionPublicationPort;
import global.oei.domain.shared.institution.InstitutionPublicationType;
import global.oei.domain.shared.institution.PublicationWorkflowStatus;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Default {@code CreateInstitutionPublicationUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateInstitutionPublicationService implements CreateInstitutionPublicationUseCase {

    @NonNull
    private final InstitutionPublicationPort institutionPublicationPort;

    @Override
    public InstitutionPublication execute(
            final InstitutionId institutionId, final InstitutionPublicationType type, final String title, final String body,
            final MemberId authorMemberId) {
        log.debug("CreateInstitutionPublicationService: execute called");
        final InstitutionPublication publication = new InstitutionPublication(
                UUID.randomUUID().toString(), institutionId, type, title, body, PublicationWorkflowStatus.DRAFT, authorMemberId,
                null, null);
        return institutionPublicationPort.save(publication);
    }
}
