package global.oei.application.web.resource.network.mapper;

import java.math.BigDecimal;
import java.util.List;

import global.oei.application.web.model.NetworkCertificationDTO;
import global.oei.application.web.model.NetworkDomainDTO;
import global.oei.application.web.model.NetworkExpertDTO;
import global.oei.application.web.model.NetworkExpertLevelDTO;
import global.oei.application.web.model.NetworkExpertPageDTO;
import global.oei.application.web.model.NetworkTopicDTO;
import global.oei.application.web.model.NetworkTopicsAndCertificationsDTO;
import global.oei.domain.shared.network.NetworkCertification;
import global.oei.domain.shared.network.NetworkDomain;
import global.oei.domain.shared.network.NetworkExpert;
import global.oei.domain.shared.network.NetworkExpertPage;
import global.oei.domain.shared.network.NetworkTopic;
import global.oei.domain.shared.network.NetworkTopicsAndCertifications;
import lombok.experimental.UtilityClass;

/**
 * Explicit hand-written mapping between the domain network graph types and their generated
 * DTOs.
 */
@UtilityClass
public class NetworkGraphDtoMapper {

    public NetworkDomainDTO toDto(final NetworkDomain domain) {
        return new NetworkDomainDTO(
                domain.id(),
                domain.label(),
                BigDecimal.valueOf(domain.x()),
                BigDecimal.valueOf(domain.y()),
                domain.neighborDomainIds());
    }

    public NetworkTopicsAndCertificationsDTO toDto(final NetworkTopicsAndCertifications topicsAndCertifications) {
        final List<NetworkTopicDTO> topics = topicsAndCertifications.topics().stream()
                .map(NetworkGraphDtoMapper::toDto)
                .toList();
        final List<NetworkCertificationDTO> certifications = topicsAndCertifications.certifications().stream()
                .map(NetworkGraphDtoMapper::toDto)
                .toList();
        return new NetworkTopicsAndCertificationsDTO(topics, certifications);
    }

    public NetworkExpertPageDTO toDto(final NetworkExpertPage page) {
        final List<NetworkExpertDTO> items = page.items().stream().map(NetworkGraphDtoMapper::toDto).toList();
        return new NetworkExpertPageDTO(items, Math.toIntExact(page.total()));
    }

    private NetworkTopicDTO toDto(final NetworkTopic topic) {
        return new NetworkTopicDTO(
                topic.id(),
                topic.domainId(),
                topic.label(),
                BigDecimal.valueOf(topic.x()),
                BigDecimal.valueOf(topic.y()),
                topic.relatedTopicIds());
    }

    private NetworkCertificationDTO toDto(final NetworkCertification certification) {
        return new NetworkCertificationDTO(
                certification.id(),
                certification.topicId(),
                certification.domainId(),
                certification.label(),
                certification.provider(),
                certification.prereqCertificationId(),
                certification.description(),
                certification.validatedSkills(),
                certification.validityPeriod(),
                certification.expertCount(),
                BigDecimal.valueOf(certification.x()),
                BigDecimal.valueOf(certification.y()));
    }

    private NetworkExpertDTO toDto(final NetworkExpert expert) {
        return new NetworkExpertDTO(
                expert.id().value().toString(),
                expert.topicId(),
                expert.domainId(),
                expert.label(),
                expert.role(),
                expert.company(),
                expert.country(),
                NetworkExpertLevelDTO.valueOf(expert.level().name()),
                expert.score(),
                expert.certificationLabels(),
                expert.badges(),
                expert.journeyTopicIds(),
                BigDecimal.valueOf(expert.x()),
                BigDecimal.valueOf(expert.y()));
    }
}
