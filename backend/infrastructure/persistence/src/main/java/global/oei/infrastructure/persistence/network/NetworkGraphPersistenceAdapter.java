package global.oei.infrastructure.persistence.network;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.network.NetworkDomain;
import global.oei.domain.shared.network.NetworkExpert;
import global.oei.domain.shared.network.NetworkExpertLevel;
import global.oei.domain.shared.network.NetworkExpertPage;
import global.oei.domain.shared.network.NetworkGraphPort;
import global.oei.domain.shared.network.NetworkTopic;
import global.oei.domain.shared.network.NetworkTopicsAndCertifications;
import global.oei.infrastructure.persistence.member.MemberEntity;
import global.oei.infrastructure.persistence.member.MemberRepository;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@link NetworkGraphPort}. Certifications always resolve empty for now (TODO:
 * no {@code network_certification} table/entity yet, out of scope for this iteration).
 * {@link NetworkExpert} joins back to {@link MemberRepository} for {@code label}/
 * {@code country} rather than duplicating them — see {@link NetworkExpertEntity}'s Javadoc.
 */
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NetworkGraphPersistenceAdapter implements NetworkGraphPort {

    private final NetworkDomainRepository domainRepository;
    private final NetworkTopicRepository topicRepository;
    private final NetworkExpertRepository expertRepository;
    private final MemberRepository memberRepository;

    @Override
    public List<NetworkDomain> listDomains() {
        return domainRepository.findAll().stream().map(NetworkGraphPersistenceAdapter::toDomain).toList();
    }

    @Override
    public Optional<NetworkTopicsAndCertifications> listTopicsAndCertifications(final String domainId) {
        if (!domainRepository.existsById(domainId)) {
            return Optional.empty();
        }
        final List<NetworkTopic> topics =
                topicRepository.findByDomainId(domainId).stream().map(NetworkGraphPersistenceAdapter::toDomain).toList();
        return Optional.of(new NetworkTopicsAndCertifications(topics, List.of()));
    }

    @Override
    public Optional<NetworkExpertPage> listExperts(final String topicId, final int offset, final int limit) {
        if (!topicRepository.existsById(topicId)) {
            return Optional.empty();
        }
        final Page<NetworkExpertEntity> page =
                expertRepository.findByTopicId(topicId, PageRequest.of(offset / limit, limit));
        final List<NetworkExpert> experts = page.getContent().stream().map(this::toDomain).toList();
        return Optional.of(new NetworkExpertPage(experts, page.getTotalElements()));
    }

    private static NetworkDomain toDomain(final NetworkDomainEntity entity) {
        return new NetworkDomain(entity.getId(), entity.getLabel(), entity.getX(), entity.getY(), splitCsv(entity.getNeighborDomainIds()));
    }

    private static NetworkTopic toDomain(final NetworkTopicEntity entity) {
        return new NetworkTopic(
                entity.getId(), entity.getDomainId(), entity.getLabel(), entity.getX(), entity.getY(),
                splitCsv(entity.getRelatedTopicIds()));
    }

    private NetworkExpert toDomain(final NetworkExpertEntity entity) {
        final MemberEntity member = memberRepository.findById(entity.getMemberId())
                .orElseThrow(() -> new IllegalStateException("Expert references a non-existent member: " + entity.getMemberId()));
        return new NetworkExpert(
                global.oei.domain.shared.member.MemberId.of(entity.getMemberId().toString()),
                entity.getTopicId(),
                entity.getDomainId(),
                member.getDisplayName(),
                entity.getRole(),
                entity.getCompany(),
                member.getCountry(),
                NetworkExpertLevel.valueOf(entity.getLevel()),
                entity.getScore(),
                splitCsv(entity.getCertificationLabels()),
                splitCsv(entity.getBadges()),
                splitCsv(entity.getJourneyTopicIds()),
                entity.getX(),
                entity.getY());
    }

    private static List<String> splitCsv(final String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
