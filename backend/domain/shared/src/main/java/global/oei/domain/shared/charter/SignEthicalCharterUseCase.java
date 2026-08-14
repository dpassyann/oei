package global.oei.domain.shared.charter;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: record the current caller's signature of the ethical charter.
 */
public interface SignEthicalCharterUseCase {

    EthicalCharterSignature execute(MemberId memberId, String version);
}
