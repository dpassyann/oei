package global.oei.domain.core.charter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.charter.EthicalCharterSignaturePort;
import global.oei.domain.shared.charter.SignEthicalCharterUseCase;
import global.oei.domain.shared.member.MemberId;

public class SignEthicalCharterService implements SignEthicalCharterUseCase {

    private final EthicalCharterSignaturePort signaturePort;

    public SignEthicalCharterService(final EthicalCharterSignaturePort signaturePort) {
        this.signaturePort = Objects.requireNonNull(signaturePort, "signaturePort must not be null");
    }

    @Override
    public EthicalCharterSignature execute(final MemberId memberId, final String version) {
        final EthicalCharterSignature signature =
                new EthicalCharterSignature(UUID.randomUUID(), memberId, version, Instant.now());
        return signaturePort.save(signature);
    }
}
