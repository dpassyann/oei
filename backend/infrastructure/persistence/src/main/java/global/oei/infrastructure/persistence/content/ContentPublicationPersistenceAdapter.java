package global.oei.infrastructure.persistence.content;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.content.ContentPublication;
import global.oei.domain.shared.content.ContentPublicationPort;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ContentPublicationPersistenceAdapter implements ContentPublicationPort {

    private final ContentPublicationRepository repository;

    @Override
    @Transactional
    public ContentPublication save(final ContentPublication publication) {
        final ContentPublicationEntity entity = new ContentPublicationEntity(
                UUID.fromString(publication.id()), UUID.fromString(publication.contentVersionId()), publication.publishedAt(),
                publication.publishedBy(), publication.channel());
        repository.save(entity);
        return publication;
    }
}
