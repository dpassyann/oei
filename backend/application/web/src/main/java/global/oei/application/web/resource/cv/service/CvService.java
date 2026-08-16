package global.oei.application.web.resource.cv.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.cv.adapter.CvAdapter;
import global.oei.domain.shared.cv.CreateCvUseCase;
import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.cv.CvSection;
import global.oei.domain.shared.cv.CvSectionType;
import global.oei.domain.shared.cv.CvTemplate;
import global.oei.domain.shared.cv.CvTemplateCatalogPort;
import global.oei.domain.shared.cv.CvTranslation;
import global.oei.domain.shared.cv.CvTranslationStatus;
import global.oei.domain.shared.cv.PdfGenerationJob;
import global.oei.domain.shared.cv.RenderCvUseCase;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvService implements CvAdapter {

    private final SecurityContextPort securityContextPort;
    private final CvPort cvPort;
    private final CvTemplateCatalogPort cvTemplateCatalogPort;
    private final CreateCvUseCase createCvUseCase;
    private final RenderCvUseCase renderCvUseCase;

    @Override
    public List<CvTemplate> listTemplates() {
        return cvTemplateCatalogPort.listTemplates();
    }

    @Override
    public List<Cv> listMyCvs() {
        return cvPort.findByMemberId(currentMemberId());
    }

    @Override
    public Cv createCv(final String templateId, final String sourceLanguage) {
        return createCvUseCase.execute(currentMemberId(), templateId, sourceLanguage);
    }

    @Override
    public Optional<Cv> getMyCv(final String id) {
        return findOwnCv(id);
    }

    @Override
    public Optional<Cv> updateMyCv(final String id, final String templateId, final String sourceLanguage) {
        return findOwnCv(id).map(cv -> cvPort.save(cv.withMetadata(templateId, sourceLanguage)));
    }

    @Override
    public Optional<CvSection> addSection(
            final String cvId, final String sectionId, final CvSectionType type, final int order,
            final Map<String, Object> content) {
        return findOwnCv(cvId).map(cv -> {
            final CvSection section = new CvSection(
                    sectionId == null ? UUID.randomUUID().toString() : sectionId, cvId, type, order, content, List.of());
            cvPort.save(cv.addSection(section));
            return section;
        });
    }

    @Override
    public Optional<CvSection> updateSection(
            final String cvId, final String sectionId, final CvSectionType type, final int order,
            final Map<String, Object> content) {
        return findOwnCv(cvId).flatMap(cv -> cv.findSection(sectionId).flatMap(existing -> {
            final CvSection updated = new CvSection(sectionId, cvId, type, order, content, existing.translations());
            return cv.replaceSection(sectionId, updated).map(updatedCv -> {
                cvPort.save(updatedCv);
                return updated;
            });
        }));
    }

    @Override
    public Optional<CvTranslation> requestSectionTranslation(
            final String cvId, final String sectionId, final String translationId, final String language,
            final Map<String, Object> content) {
        return findOwnCv(cvId).flatMap(cv -> {
            final CvTranslation translation = new CvTranslation(
                    translationId == null ? UUID.randomUUID().toString() : translationId,
                    sectionId,
                    language,
                    content,
                    CvTranslationStatus.PENDING_VALIDATION,
                    Instant.now(),
                    null);
            return cv.addSectionTranslation(sectionId, translation).map(updatedCv -> {
                cvPort.save(updatedCv);
                return translation;
            });
        });
    }

    @Override
    public Optional<CvTranslation> validateSectionTranslation(final String cvId, final String sectionId, final String language) {
        final String validatedBy = currentMemberId().toString();
        return findOwnCv(cvId).flatMap(cv -> cv.validateSectionTranslation(sectionId, language, validatedBy).flatMap(updatedCv -> {
            cvPort.save(updatedCv);
            return updatedCv.findSection(sectionId)
                    .flatMap(section -> section.translations().stream()
                            .filter(translation -> translation.language().equals(language))
                            .findFirst());
        }));
    }

    @Override
    public Optional<PdfGenerationJob> renderCv(final String cvId, final String language, final List<String> includeBadges) {
        return findOwnCv(cvId).map(cv -> renderCvUseCase.execute(cv, language, includeBadges));
    }

    private Optional<Cv> findOwnCv(final String id) {
        final MemberId memberId = currentMemberId();
        return cvPort.findById(id).filter(cv -> cv.memberId().equals(memberId));
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
