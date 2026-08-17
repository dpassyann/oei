package global.oei.domain.core.institution;

import java.time.Instant;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.institution.EmploymentAffiliation;
import global.oei.domain.shared.institution.EmploymentAffiliationPort;
import global.oei.domain.shared.institution.EmploymentAffiliationStatus;
import global.oei.domain.shared.institution.EmploymentAffiliationVerificationMethod;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.RequestEmploymentAffiliationUseCase;
import global.oei.domain.shared.member.MemberId;

/**
 * Enforces that a self-requested affiliation always starts {@link EmploymentAffiliationStatus#PENDING}
 * with {@link EmploymentAffiliationVerificationMethod#INSTITUTION_VALIDATION} — an email
 * domain match alone is never sufficient to auto-verify (see the operation's own contract
 * summary): a human institution validator must always decide.
 */
@Slf4j
@RequiredArgsConstructor
public class RequestEmploymentAffiliationService implements RequestEmploymentAffiliationUseCase {

    @NonNull
    private final EmploymentAffiliationPort employmentAffiliationPort;

    @Override
    public EmploymentAffiliation execute(final MemberId memberId, final InstitutionId institutionId) {
        log.debug("RequestEmploymentAffiliationService: execute called");
        final EmploymentAffiliation affiliation = new EmploymentAffiliation(
                UUID.randomUUID().toString(),
                memberId,
                institutionId,
                EmploymentAffiliationVerificationMethod.INSTITUTION_VALIDATION,
                EmploymentAffiliationStatus.PENDING,
                Instant.now(),
                null,
                null,
                null,
                null);
        return employmentAffiliationPort.save(affiliation);
    }
}
