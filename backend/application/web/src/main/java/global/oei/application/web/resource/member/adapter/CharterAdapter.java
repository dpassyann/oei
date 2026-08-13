package global.oei.application.web.resource.member.adapter;

import global.oei.domain.shared.charter.EthicalCharterSignature;

public interface CharterAdapter {

    EthicalCharterSignature signEthicalCharter(String version);
}
