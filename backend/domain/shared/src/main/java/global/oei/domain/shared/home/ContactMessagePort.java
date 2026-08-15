package global.oei.domain.shared.home;

/**
 * Outbound port for persisting submitted {@link ContactMessage}s.
 */
public interface ContactMessagePort {

    ContactMessage save(ContactMessage message);
}
