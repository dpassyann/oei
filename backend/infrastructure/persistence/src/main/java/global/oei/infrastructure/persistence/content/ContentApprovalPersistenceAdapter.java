package global.oei.infrastructure.persistence.content;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.content.ContentApproval;
import global.oei.domain.shared.content.ContentApprovalPort;

@RequiredArgsConstructor
public class ContentApprovalPersistenceAdapter implements ContentApprovalPort {

    private final ContentApprovalRepository repository;

    @Override
    @Transactional
    public ContentApproval save(final ContentApproval approval) {
        final ContentApprovalEntity entity = new ContentApprovalEntity(
                UUID.fromString(approval.id()), UUID.fromString(approval.contentVersionId()), approval.role().name(),
                approval.decision().name(), approval.comment(), approval.approverId(), approval.decidedAt());
        repository.save(entity);
        return approval;
    }
}
