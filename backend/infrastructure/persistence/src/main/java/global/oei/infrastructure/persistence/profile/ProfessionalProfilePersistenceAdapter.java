package global.oei.infrastructure.persistence.profile;

import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileLookupPort;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

/**
 * Implements {@link ProfileLookupPort} by (de)serializing the whole
 * {@link ProfessionalProfile} record as JSON into {@link ProfessionalProfileEntity#getProfileJson()}
 * — see that entity's Javadoc for why. {@code ProfessionalProfile} itself needs no Jackson
 * annotations: records are natively supported by {@code jackson-databind} (resolved via the
 * canonical constructor + compiled parameter names). Jackson 3's {@code jackson-databind}
 * supports {@code java.time} types natively, so no separate date/time module is registered.
 */
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfessionalProfilePersistenceAdapter implements ProfileLookupPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ProfessionalProfileRepository repository;

    @Override
    public Optional<ProfessionalProfile> findByMemberId(final MemberId memberId) {
        return repository.findById(memberId.value()).map(this::toDomain);
    }

    @Override
    @Transactional
    public ProfessionalProfile save(final ProfessionalProfile profile) {
        final ProfessionalProfileEntity entity = new ProfessionalProfileEntity(
                profile.memberId().value(), toJson(profile), profile.completenessScore());
        repository.save(entity);
        return profile;
    }

    @SneakyThrows
    private ProfessionalProfile toDomain(final ProfessionalProfileEntity entity) {
        return OBJECT_MAPPER.readValue(entity.getProfileJson(), ProfessionalProfile.class);
    }

    @SneakyThrows
    private static String toJson(final ProfessionalProfile profile) {
        return OBJECT_MAPPER.writeValueAsString(profile);
    }
}
