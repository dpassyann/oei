package global.oei.domain.core.network;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.network.CompensationPeriod;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import global.oei.domain.shared.network.SalaryInsightPort;

class GetSalaryInsightServiceTest {

    private final SalaryInsightPort port = mock(SalaryInsightPort.class);
    private final GetSalaryInsightService service = new GetSalaryInsightService(port);

    @Test
    void execute_returnsInsightWhenSampleSizeMeetsThreshold() {
        final SalaryInsight insight = new SalaryInsight(80000, 120000, "CHF", CompensationPeriod.YEAR, 5, "Suisse");
        when(port.aggregate(NetworkSalaryNodeType.DOMAIN, "ia", "Suisse")).thenReturn(Optional.of(insight));

        assertThat(service.execute(NetworkSalaryNodeType.DOMAIN, "ia", "Suisse")).contains(insight);
    }

    @Test
    void execute_hidesInsightWhenSampleSizeBelowThreshold() {
        final SalaryInsight insight = new SalaryInsight(80000, 120000, "CHF", CompensationPeriod.YEAR, 4, "Suisse");
        when(port.aggregate(NetworkSalaryNodeType.DOMAIN, "ia", "Suisse")).thenReturn(Optional.of(insight));

        assertThat(service.execute(NetworkSalaryNodeType.DOMAIN, "ia", "Suisse")).isEmpty();
    }

    @Test
    void execute_returnsEmptyWhenPortHasNoAggregate() {
        when(port.aggregate(NetworkSalaryNodeType.TOPIC, "kubernetes", null)).thenReturn(Optional.empty());

        assertThat(service.execute(NetworkSalaryNodeType.TOPIC, "kubernetes", null)).isEmpty();
    }

    @Test
    void constructor_rejectsNullPort() {
        assertThatThrownBy(() -> new GetSalaryInsightService(null)).isInstanceOf(NullPointerException.class);
    }
}
