package global.oei.infrastructure.persistence.cv;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.member.MemberId;

/**
 * Implements {@link CvPort} by (de)serializing the whole {@link Cv} record as JSON into
 * {@link CvEntity#getCvJson()} — see that entity's Javadoc for why. {@code Cv} (and its
 * nested {@code CvSection}/{@code CvTranslation}) need no Jackson annotations: records are
 * natively supported by {@code jackson-databind}. Jackson 3's {@code jackson-databind}
 * supports {@code java.time} types natively, so no separate date/time module is registered.
 */
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CvPersistenceAdapter implements CvPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final CvRepository repository;

    @Override
    @Transactional
    public Cv save(final Cv cv) {
        final CvEntity entity =
                new CvEntity(UUID.fromString(cv.id()), cv.memberId().value(), cv.status().name(), toJson(cv));
        repository.save(entity);
        return cv;
    }

    @Override
    public Optional<Cv> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(CvPersistenceAdapter::toDomain);
    }

    @Override
    public List<Cv> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream().map(CvPersistenceAdapter::toDomain).toList();
    }

    @SneakyThrows
    private static Cv toDomain(final CvEntity entity) {
        return OBJECT_MAPPER.readValue(entity.getCvJson(), Cv.class);
    }

    @SneakyThrows
    private static String toJson(final Cv cv) {
        return OBJECT_MAPPER.writeValueAsString(cv);
    }
}
