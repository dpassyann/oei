package global.oei.application.web.resource.network.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.network.adapter.NetworkGraphAdapter;
import global.oei.domain.shared.network.NetworkDomain;
import global.oei.domain.shared.network.NetworkExpertPage;
import global.oei.domain.shared.network.NetworkGraphPort;
import global.oei.domain.shared.network.NetworkTopicsAndCertifications;

/**
 * Implements {@link NetworkGraphAdapter} by delegating to {@link NetworkGraphPort} directly
 * — a {@code domain-shared} interface, resolved to a concrete bean by
 * {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}. No intermediate
 * {@code domain-core} use case: these are plain reads with no business rule to enforce.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NetworkGraphService implements NetworkGraphAdapter {

    private final NetworkGraphPort networkGraphPort;

    @Override
    public List<NetworkDomain> listDomains() {
        return networkGraphPort.listDomains();
    }

    @Override
    public Optional<NetworkTopicsAndCertifications> listTopicsAndCertifications(final String domainId) {
        return networkGraphPort.listTopicsAndCertifications(domainId);
    }

    @Override
    public Optional<NetworkExpertPage> listExperts(final String topicId, final int offset, final int limit) {
        return networkGraphPort.listExperts(topicId, offset, limit);
    }
}
