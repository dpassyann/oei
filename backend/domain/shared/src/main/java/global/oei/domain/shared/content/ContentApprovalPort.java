package global.oei.domain.shared.content;

/**
 * Outbound port for {@link ContentApproval}.
 */
public interface ContentApprovalPort {

    ContentApproval save(ContentApproval approval);
}
