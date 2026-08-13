package global.oei.domain.shared.network;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for the Professional Neural Network's knowledge graph (domains -> topics/
 * certifications -> experts), shaped around the canvas's zoom levels — mirrors the
 * frontend's {@code NetworkGraphPort} (network-graph.port.ts) exactly, down to
 * {@code listExperts}'s {@code offset}/{@code limit} pagination.
 *
 * <p>Consumed directly by {@code application-web}'s network adapter/service, with no
 * intermediate {@code domain-core} use case: these are plain reads with no business rule to
 * enforce (unlike {@link SalaryInsightPort}, which needs the anonymization threshold applied
 * on top by {@code domain-core}).</p>
 */
public interface NetworkGraphPort {

    List<NetworkDomain> listDomains();

    Optional<NetworkTopicsAndCertifications> listTopicsAndCertifications(String domainId);

    Optional<NetworkExpertPage> listExperts(String topicId, int offset, int limit);
}
