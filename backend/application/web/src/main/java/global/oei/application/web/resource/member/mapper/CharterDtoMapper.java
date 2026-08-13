package global.oei.application.web.resource.member.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.EthicalCharterSignatureDTO;
import global.oei.domain.shared.charter.EthicalCharterSignature;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CharterDtoMapper {

    public EthicalCharterSignatureDTO toDto(final EthicalCharterSignature signature) {
        return new EthicalCharterSignatureDTO(
                signature.id().toString(),
                signature.memberId().value().toString(),
                signature.version(),
                LocalDateTime.ofInstant(signature.signedAt(), ZoneOffset.UTC));
    }
}
