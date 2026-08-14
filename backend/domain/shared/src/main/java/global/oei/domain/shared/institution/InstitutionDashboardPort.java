package global.oei.domain.shared.institution;

/**
 * Outbound port computing an {@link InstitutionDashboard}.
 */
public interface InstitutionDashboardPort {

    InstitutionDashboard compute(InstitutionId institutionId);
}
