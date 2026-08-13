package global.oei.application.web.resource.network;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.PublicNetworkApi;
import global.oei.application.web.model.NetworkDomainDTO;
import global.oei.application.web.model.NetworkExpertPageDTO;
import global.oei.application.web.model.NetworkTopicsAndCertificationsDTO;
import global.oei.application.web.model.SalaryInsightDTO;
import global.oei.application.web.resource.network.adapter.NetworkGraphAdapter;
import global.oei.application.web.resource.network.adapter.NetworkSalaryAdapter;
import global.oei.application.web.resource.network.mapper.NetworkGraphDtoMapper;
import global.oei.application.web.resource.network.mapper.SalaryInsightDtoMapper;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link PublicNetworkApi}: the graph itself (domains, topics/
 * certifications per domain, paginated experts per topic) and anonymized salary transparency
 * for the Professional Neural Network. A single {@code @RestController} bean is required per
 * generated API interface (see {@code MemberProfileResource}'s Javadoc for why), so both
 * concerns share this one class with separate internal {@code *Adapter}/
 * {@code service.*Service} pairs ({@link NetworkGraphAdapter}/{@link NetworkSalaryAdapter}).
 *
 * <p>Absence of data resolves to {@code 204 No Content} for salary insights (a value state —
 * not enough anonymized contributors — never an error, matching the frontend's
 * {@code NetworkGraphPort.getSalaryInsight} convention) and to {@code 404 Not Found} for an
 * unknown domain/topic id (a genuinely missing resource) on the graph operations.</p>
 */
@RestController
@RequiredArgsConstructor
public class NetworkResource implements PublicNetworkApi {

    private final NetworkGraphAdapter networkGraphAdapter;
    private final NetworkSalaryAdapter networkSalaryAdapter;

    @Override
    public ResponseEntity<List<NetworkDomainDTO>> listNetworkDomains() {
        final List<NetworkDomainDTO> domains =
                networkGraphAdapter.listDomains().stream().map(NetworkGraphDtoMapper::toDto).toList();
        return ResponseEntity.ok(domains);
    }

    @Override
    public ResponseEntity<NetworkTopicsAndCertificationsDTO> listNetworkTopicsAndCertifications(final String domainId) {
        return networkGraphAdapter.listTopicsAndCertifications(domainId)
                .map(NetworkGraphDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<NetworkExpertPageDTO> listNetworkExperts(
            final String topicId, final Integer offset, final Integer limit) {
        return networkGraphAdapter.listExperts(topicId, offset, limit)
                .map(NetworkGraphDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<SalaryInsightDTO> getNetworkDomainSalaryInsight(final String domainId, final String country) {
        return toSalaryResponse(NetworkSalaryNodeType.DOMAIN, domainId, country);
    }

    @Override
    public ResponseEntity<SalaryInsightDTO> getNetworkTopicSalaryInsight(final String topicId, final String country) {
        return toSalaryResponse(NetworkSalaryNodeType.TOPIC, topicId, country);
    }

    @Override
    public ResponseEntity<SalaryInsightDTO> getNetworkCertificationSalaryInsight(
            final String certificationId, final String country) {
        return toSalaryResponse(NetworkSalaryNodeType.CERTIFICATION, certificationId, country);
    }

    private ResponseEntity<SalaryInsightDTO> toSalaryResponse(
            final NetworkSalaryNodeType nodeType, final String nodeId, final String country) {
        final Optional<SalaryInsight> insight = networkSalaryAdapter.getSalaryInsight(nodeType, nodeId, country);
        return insight.map(SalaryInsightDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
