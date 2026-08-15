package global.oei.application.web.resource.contribution.adapter;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.content.ContentComment;
import global.oei.domain.shared.content.ContentContribution;

public interface ContributionAdapter {

    List<ContentContribution> listMyContributions();

    ContentContribution create(String contentId, String patch);

    Optional<List<ContentComment>> listComments(String contributionId);

    Optional<ContentComment> addComment(String contributionId, String body);
}
