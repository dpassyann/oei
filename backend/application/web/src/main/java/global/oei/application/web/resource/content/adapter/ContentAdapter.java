package global.oei.application.web.resource.content.adapter;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentApproval;
import global.oei.domain.shared.content.ContentApprovalDecision;
import global.oei.domain.shared.content.ContentApprovalRole;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentGovernance;
import global.oei.domain.shared.content.ContentPublication;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentTranslation;
import global.oei.domain.shared.content.ContentTranslationStatus;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentWorkflowStatus;

public interface ContentAdapter {

    List<Content> listContent(ContentType type, ContentWorkflowStatus status, String lang, String tag, String q);

    Content createContent(
            ContentType type, String slug, ContentSourceType sourceType, String title, List<String> tags, ContentGovernance governance);

    Optional<Content> getContent(String id);

    Optional<ContentVersion> updateContent(String id, String language, String title, String body, Map<String, Object> frontMatter);

    List<ContentVersion> listVersions(String id);

    Optional<Content> submitContent(String id);

    Optional<ContentApproval> approveContent(String id, ContentApprovalRole role, ContentApprovalDecision decision, String comment);

    Optional<Content> rejectContent(String id, String comment);

    Optional<Content> requestTranslation(String id);

    Optional<Content> scheduleContent(String id);

    Optional<ContentPublication> publishContent(String id);

    Optional<Content> archiveContent(String id);

    Optional<ContentTranslation> createTranslation(
            String id, String language, ContentTranslationStatus status, String translatorId);

    Optional<ContentTranslation> validateTranslation(String id, String language);

    List<ContentContribution> listContributions(String id);
}
