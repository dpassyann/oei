package global.oei.application.web.resource.member.mapper;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.MemberBootstrapDTO;
import global.oei.application.web.model.MembershipStatusDTO;
import global.oei.application.web.model.ProfileImportStatusDTO;
import global.oei.application.web.model.ProfileStatusDTO;
import global.oei.domain.shared.profile.MemberBootstrap;

/**
 * Maps {@link MemberBootstrap} to the generated {@link MemberBootstrapDTO}.
 */
@UtilityClass
public class BootstrapDtoMapper {

    public MemberBootstrapDTO toDto(final MemberBootstrap bootstrap) {
        final MemberBootstrapDTO dto = new MemberBootstrapDTO(
                bootstrap.memberId().value().toString(),
                ProfileStatusDTO.valueOf(bootstrap.profileStatus().name()));
        if (bootstrap.membershipStatus() != null) {
            dto.setMembershipStatus(MembershipStatusDTO.valueOf(bootstrap.membershipStatus().name()));
        }
        dto.setProfileId(JsonNullable.of(bootstrap.profileId()));
        if (bootstrap.cvStatus() != null) {
            dto.setCvStatus(ProfileImportStatusDTO.valueOf(bootstrap.cvStatus().name()));
        }
        return dto;
    }
}


