package global.oei.application.web.resource.cv.adapter;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvSection;
import global.oei.domain.shared.cv.CvSectionType;
import global.oei.domain.shared.cv.CvTemplate;
import global.oei.domain.shared.cv.CvTranslation;
import global.oei.domain.shared.cv.PdfGenerationJob;

public interface CvAdapter {

    List<CvTemplate> listTemplates();

    List<Cv> listMyCvs();

    Cv createCv(String templateId, String sourceLanguage);

    Optional<Cv> getMyCv(String id);

    Optional<Cv> updateMyCv(String id, String templateId, String sourceLanguage);

    Optional<CvSection> addSection(
            String cvId, String sectionId, CvSectionType type, int order, Map<String, Object> content);

    Optional<CvSection> updateSection(
            String cvId, String sectionId, CvSectionType type, int order, Map<String, Object> content);

    Optional<CvTranslation> requestSectionTranslation(
            String cvId, String sectionId, String translationId, String language, Map<String, Object> content);

    Optional<CvTranslation> validateSectionTranslation(String cvId, String sectionId, String language);

    Optional<PdfGenerationJob> renderCv(String cvId, String language, List<String> includeBadges);
}
