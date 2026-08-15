package global.oei.domain.shared.home;

/**
 * Outbound port for persisting captured {@link Lead}s.
 */
public interface LeadPort {

    Lead save(Lead lead);
}
