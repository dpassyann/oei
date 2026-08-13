package global.oei.application.web.resource.member.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.member.adapter.CharterAdapter;
import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.charter.SignEthicalCharterUseCase;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CharterService implements CharterAdapter {

    private final SecurityContextPort securityContextPort;
    private final SignEthicalCharterUseCase signEthicalCharterUseCase;

    @Override
    public EthicalCharterSignature signEthicalCharter(final String version) {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return signEthicalCharterUseCase.execute(MemberId.of(identity.subject()), version);
    }
}
