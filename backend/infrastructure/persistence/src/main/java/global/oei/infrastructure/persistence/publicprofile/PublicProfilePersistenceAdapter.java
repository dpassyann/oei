package global.oei.infrastructure.persistence.publicprofile;

import java.util.Arrays;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.publicprofile.PublicProfile;
import global.oei.domain.shared.publicprofile.PublicProfilePort;
import global.oei.infrastructure.persistence.member.MemberEntity;
import global.oei.infrastructure.persistence.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicProfilePersistenceAdapter implements PublicProfilePort {

    private final PublicProfileRepository repository;
    private final MemberRepository memberRepository;

    @Override
    public PublicProfile findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value())
                .map(PublicProfilePersistenceAdapter::toDomain)
                .orElseGet(() -> defaultProfile(memberId));
    }

    @Override
    @Transactional
    public PublicProfile save(final PublicProfile profile) {
        final PublicProfileEntity entity = new PublicProfileEntity(
                profile.memberId().value(),
                profile.publicSlug(),
                String.join(",", profile.visibleFields()),
                profile.seoDescription(),
                profile.publishedAt(),
                profile.viewsCount());
        repository.save(entity);
        return profile;
    }

    private PublicProfile defaultProfile(final MemberId memberId) {
        final MemberEntity member = memberRepository.findById(memberId.value())
                .orElseThrow(() -> new IllegalStateException("member not found: " + memberId));
        return new PublicProfile(memberId, member.getPublicSlug(), List.of(), null, null, 0);
    }

    private static PublicProfile toDomain(final PublicProfileEntity entity) {
        final List<String> visibleFields = entity.getVisibleFields().isBlank()
                ? List.of()
                : Arrays.asList(entity.getVisibleFields().split(","));
        return new PublicProfile(
                new MemberId(entity.getMemberId()), entity.getPublicSlug(), visibleFields, entity.getSeoDescription(),
                entity.getPublishedAt(), entity.getViewsCount());
    }
}
