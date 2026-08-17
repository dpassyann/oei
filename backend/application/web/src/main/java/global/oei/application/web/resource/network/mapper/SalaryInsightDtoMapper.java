package global.oei.application.web.resource.network.mapper;

import java.math.BigDecimal;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.CompensationPeriodDTO;
import global.oei.application.web.model.SalaryInsightDTO;
import global.oei.domain.shared.network.SalaryInsight;

/**
 * Explicit hand-written mapping between the domain {@link SalaryInsight} and the generated
 * {@link SalaryInsightDTO} at the HTTP boundary — small enough (six fields) that MapStruct
 * would only add ceremony.
 */
@UtilityClass
public class SalaryInsightDtoMapper {

    public SalaryInsightDTO toDto(final SalaryInsight insight) {
        final SalaryInsightDTO dto = new SalaryInsightDTO(
                BigDecimal.valueOf(insight.low()),
                BigDecimal.valueOf(insight.high()),
                insight.currency(),
                CompensationPeriodDTO.valueOf(insight.period().name()),
                insight.sampleSize());
        dto.setCountry(insight.country());
        return dto;
    }
}
