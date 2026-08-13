package global.oei.domain.shared.charter;

import global.oei.domain.shared.member.MemberId;

public interface SignEthicalCharterUseCase {

    EthicalCharterSignature execute(MemberId memberId, String version);
}
