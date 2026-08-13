package global.oei.application.web.resource.network.adapter;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.network.NetworkDomain;
import global.oei.domain.shared.network.NetworkExpertPage;
import global.oei.domain.shared.network.NetworkTopicsAndCertifications;

public interface NetworkGraphAdapter {

    List<NetworkDomain> listDomains();

    Optional<NetworkTopicsAndCertifications> listTopicsAndCertifications(String domainId);

    Optional<NetworkExpertPage> listExperts(String topicId, int offset, int limit);
}
