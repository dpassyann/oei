package global.oei.domain.core.institution;

import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.institution.CreateInstitutionPublicationUseCase;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionPublication;
import global.oei.domain.shared.institution.InstitutionPublicationPort;
import global.oei.domain.shared.institution.InstitutionPublicationType;
import global.oei.domain.shared.institution.PublicationWorkflowStatus;
import global.oei.domain.shared.member.MemberId;

public class CreateInstitutionPublicationService implements CreateInstitutionPublicationUseCase {

    private final InstitutionPublicationPort institutionPublicationPort;

    public CreateInstitutionPublicationService(final InstitutionPublicationPort institutionPublicationPort) {
        this.institutionPublicationPort = Objects.requireNonNull(institutionPublicationPort, "institutionPublicationPort must not be null");
    }

    @Override
    public InstitutionPublication execute(
            final InstitutionId institutionId, final InstitutionPublicationType type, final String title, final String body,
            final MemberId authorMemberId) {
        final InstitutionPublication publication = new InstitutionPublication(
                UUID.randomUUID().toString(), institutionId, type, title, body, PublicationWorkflowStatus.DRAFT, authorMemberId,
                null, null);
        return institutionPublicationPort.save(publication);
    }
}
