package global.oei.infrastructure.persistence.charter;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.charter.EthicalCharterSignaturePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Transactional
public class EthicalCharterSignaturePersistenceAdapter implements EthicalCharterSignaturePort {

    private final EthicalCharterSignatureRepository repository;

    @Override
    public EthicalCharterSignature save(final EthicalCharterSignature signature) {
        repository.save(new EthicalCharterSignatureEntity(
                signature.id(), signature.memberId().value(), signature.version(), signature.signedAt()));
        return signature;
    }
}
