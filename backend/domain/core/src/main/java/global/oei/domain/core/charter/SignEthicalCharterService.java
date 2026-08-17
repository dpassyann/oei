package global.oei.domain.core.charter;

import java.time.Instant;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.charter.EthicalCharterSignaturePort;
import global.oei.domain.shared.charter.SignEthicalCharterUseCase;
import global.oei.domain.shared.member.MemberId;

/**
 * Default {@code SignEthicalCharterUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class SignEthicalCharterService implements SignEthicalCharterUseCase {

    @NonNull
    private final EthicalCharterSignaturePort signaturePort;

    @Override
    public EthicalCharterSignature execute(final MemberId memberId, final String version) {
        log.debug("SignEthicalCharterService: execute called");
        final EthicalCharterSignature signature =
                new EthicalCharterSignature(UUID.randomUUID(), memberId, version, Instant.now());
        return signaturePort.save(signature);
    }
}
