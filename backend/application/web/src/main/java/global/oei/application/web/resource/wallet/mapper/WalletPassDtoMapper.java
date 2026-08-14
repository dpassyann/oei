package global.oei.application.web.resource.wallet.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.MembershipTierDTO;
import global.oei.application.web.model.WalletPassDTO;
import global.oei.application.web.model.WalletPassProviderDTO;
import global.oei.application.web.model.WalletPassStatusDTO;
import global.oei.application.web.model.WalletPassVerificationDTO;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassVerification;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class WalletPassDtoMapper {

    public WalletPassDTO toDto(final WalletPass pass) {
        final WalletPassDTO dto = new WalletPassDTO(
                pass.id(),
                pass.memberId().value().toString(),
                WalletPassProviderDTO.valueOf(pass.provider().name()),
                WalletPassStatusDTO.valueOf(pass.status().name()),
                pass.serialNumber(),
                pass.mocked());
        dto.setVerificationUrl(pass.verificationUrl() == null ? null : URI.create(pass.verificationUrl()));
        dto.setLevelColor(pass.levelColor());
        dto.setIssuedAt(pass.issuedAt() == null ? null : LocalDateTime.ofInstant(pass.issuedAt(), ZoneOffset.UTC));
        dto.setRevokedAt(JsonNullable.of(
                pass.revokedAt() == null ? null : LocalDateTime.ofInstant(pass.revokedAt(), ZoneOffset.UTC)));
        return dto;
    }

    public WalletPassVerificationDTO toDto(final WalletPassVerification verification) {
        final WalletPassVerificationDTO dto = new WalletPassVerificationDTO(
                verification.valid(), WalletPassStatusDTO.valueOf(verification.status().name()));
        dto.setMemberPublicSlug(verification.memberPublicSlug());
        dto.setTier(verification.tier() == null ? null : MembershipTierDTO.valueOf(verification.tier().name()));
        return dto;
    }
}
