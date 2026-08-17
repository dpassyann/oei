package global.oei.application.web.resource.certification.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.certification.adapter.CertificationAdapter;
import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationGoalPort;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.CreateRecognizedCertificationUseCase;
import global.oei.domain.shared.certification.DeclareCertificationUseCase;
import global.oei.domain.shared.certification.MemberCertificationGoal;
import global.oei.domain.shared.certification.MemberCertificationGoalStatus;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPage;
import global.oei.domain.shared.certification.RecognizedCertificationPort;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificationService implements CertificationAdapter {

    private final SecurityContextPort securityContextPort;
    private final CertificationPort certificationPort;
    private final CertificationGoalPort certificationGoalPort;
    private final DeclareCertificationUseCase declareCertificationUseCase;
    private final RecognizedCertificationPort recognizedCertificationPort;
    private final CreateRecognizedCertificationUseCase createRecognizedCertificationUseCase;

    @Override
    public List<Certification> listMyCertifications() {
        return certificationPort.findByMemberId(currentMemberId());
    }

    @Override
    public Certification declareCertification(
            final String name,
            final String issuingOrganization,
            final String recognizedCertificationId,
            final LocalDate issuedAt,
            final LocalDate expiresAt,
            final String proofDocumentUrl) {
        return declareCertificationUseCase.execute(
                currentMemberId(), name, issuingOrganization, recognizedCertificationId, issuedAt, expiresAt, proofDocumentUrl);
    }

    @Override
    public Optional<Certification> getMyCertification(final String id) {
        final MemberId memberId = currentMemberId();
        return certificationPort.findById(id).filter(certification -> certification.memberId().equals(memberId));
    }

    @Override
    public List<MemberCertificationGoal> listMyCertificationGoals() {
        return certificationGoalPort.findByMemberId(currentMemberId());
    }

    @Override
    public MemberCertificationGoal upsertMyCertificationGoal(
            final String recognizedCertificationId, final MemberCertificationGoalStatus status) {
        final Instant now = Instant.now();
        return certificationGoalPort.upsert(new MemberCertificationGoal(
                UUID.randomUUID().toString(), currentMemberId(), recognizedCertificationId, status, now, now));
    }

    // --- admin catalog governance ---

    @Override
    public RecognizedCertificationPage listRecognizedCertificationCatalog(final int page, final int pageSize) {
        return recognizedCertificationPort.findCatalog(page, pageSize);
    }

    @Override
    public RecognizedCertification createRecognizedCertificationCatalogEntry(
            final String name, final String issuingOrganization, final String catalogReference, final boolean autoValidate,
            final String domain, final CertificationLevel level, final String language, final CertificationOeiStatus oeiStatus,
            final List<String> competencies, final Integer validityMonths, final String associatedPathRoute, final String description) {
        return createRecognizedCertificationUseCase.execute(
                name, issuingOrganization, catalogReference, autoValidate, domain, level, language, oeiStatus, competencies,
                validityMonths, associatedPathRoute, description);
    }

    @Override
    public Optional<RecognizedCertification> updateRecognizedCertificationCatalogEntry(
            final String id, final RecognizedCertification submitted) {
        return recognizedCertificationPort.findById(id)
                .map(existing -> recognizedCertificationPort.save(existing.withDetails(submitted)));
    }

    @Override
    public Optional<RecognizedCertification> archiveRecognizedCertificationCatalogEntry(final String id) {
        return recognizedCertificationPort.findById(id).map(existing -> recognizedCertificationPort.save(existing.archive()));
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
