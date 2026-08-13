package global.oei.application.web.resource.network.adapter;

import java.util.Optional;

import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;

/**
 * Adapter interface between the network domain's {@code *Resource} classes and the domain.
 * See {@code MembershipAdapter} (resource.member.adapter) for the project-wide convention
 * this mirrors.
 */
public interface NetworkSalaryAdapter {

    Optional<SalaryInsight> getSalaryInsight(NetworkSalaryNodeType nodeType, String nodeId, String country);
}
