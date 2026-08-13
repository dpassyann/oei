package global.oei.application.web.resource.network;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.PublicNetworkApi;
import global.oei.application.web.model.SalaryInsightDTO;
import global.oei.application.web.resource.network.adapter.NetworkSalaryAdapter;
import global.oei.application.web.resource.network.mapper.SalaryInsightDtoMapper;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import lombok.RequiredArgsConstructor;

/**
 * Implements the three {@code GET .../salary-insight} operations of {@link PublicNetworkApi}
 * (domains/topics/certifications) — anonymized salary transparency for the Professional
 * Neural Network. Every other operation on this interface (listNetworkDomains,
 * listNetworkTopicsAndCertifications, listNetworkExperts) falls back to the generator's
 * default {@code 501 Not Implemented} behavior until implemented (TODO: requires persisting
 * the graph itself — domains/topics/certifications/experts — which this iteration does not
 * cover).
 *
 * <p>Absence of data resolves to {@code 204 No Content} — a value state (not enough
 * anonymized contributors), never an error — matching the frontend
 * {@code NetworkGraphPort.getSalaryInsight} convention of resolving to {@code undefined}
 * rather than throwing.</p>
 */
@RestController
@RequiredArgsConstructor
public class NetworkSalaryResource implements PublicNetworkApi {

    private final NetworkSalaryAdapter networkSalaryAdapter;

    @Override
    public ResponseEntity<SalaryInsightDTO> getNetworkDomainSalaryInsight(final String domainId, final String country) {
        return toResponse(NetworkSalaryNodeType.DOMAIN, domainId, country);
    }

    @Override
    public ResponseEntity<SalaryInsightDTO> getNetworkTopicSalaryInsight(final String topicId, final String country) {
        return toResponse(NetworkSalaryNodeType.TOPIC, topicId, country);
    }

    @Override
    public ResponseEntity<SalaryInsightDTO> getNetworkCertificationSalaryInsight(
            final String certificationId, final String country) {
        return toResponse(NetworkSalaryNodeType.CERTIFICATION, certificationId, country);
    }

    private ResponseEntity<SalaryInsightDTO> toResponse(
            final NetworkSalaryNodeType nodeType, final String nodeId, final String country) {
        final Optional<SalaryInsight> insight = networkSalaryAdapter.getSalaryInsight(nodeType, nodeId, country);
        return insight.map(SalaryInsightDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
