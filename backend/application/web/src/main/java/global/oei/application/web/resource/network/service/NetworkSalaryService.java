package global.oei.application.web.resource.network.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import global.oei.application.web.resource.network.adapter.NetworkSalaryAdapter;
import global.oei.domain.shared.network.GetSalaryInsightUseCase;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@link NetworkSalaryAdapter} by delegating to {@link GetSalaryInsightUseCase} —
 * a {@code domain-shared} interface, resolved to a concrete bean by
 * {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}. This class never
 * references a concrete {@code domain-core}/infrastructure type.
 *
 * <p>{@code @Service} + Lombok {@code @RequiredArgsConstructor}: discovered by
 * {@code OeiBackendApplication}'s own {@code @SpringBootApplication} component scan, not
 * registered via a hand-written {@code @Bean} method.</p>
 */
@Service
@RequiredArgsConstructor
public class NetworkSalaryService implements NetworkSalaryAdapter {

    private final GetSalaryInsightUseCase getSalaryInsightUseCase;

    @Override
    public Optional<SalaryInsight> getSalaryInsight(
            final NetworkSalaryNodeType nodeType, final String nodeId, final String country) {
        return getSalaryInsightUseCase.execute(nodeType, nodeId, country);
    }
}
