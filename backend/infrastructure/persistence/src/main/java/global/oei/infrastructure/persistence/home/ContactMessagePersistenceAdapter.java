package global.oei.infrastructure.persistence.home;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.home.ContactMessage;
import global.oei.domain.shared.home.ContactMessagePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactMessagePersistenceAdapter implements ContactMessagePort {

    private final HomeContactMessageRepository repository;

    @Override
    @Transactional
    public ContactMessage save(final ContactMessage message) {
        repository.save(new HomeContactMessageEntity(
                UUID.fromString(message.id()), message.name(), message.email(), message.subject(), message.message(),
                message.submittedAt()));
        return message;
    }
}
