package global.oei.domain.shared.content;

/**
 * Outbound port for {@link ContentPublication}.
 */
public interface ContentPublicationPort {

    ContentPublication save(ContentPublication publication);
}
