package global.oei.application.web.resource.member.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.Instant;

import global.oei.application.web.model.MembershipDTO;
import global.oei.application.web.model.MembershipStatusDTO;
import global.oei.application.web.model.MembershipTierDTO;
import global.oei.domain.shared.membership.Membership;
import org.openapitools.jackson.nullable.JsonNullable;

/**
 * Explicit hand-written mapping between the domain {@link Membership} and the generated
 * {@link MembershipDTO} at the HTTP boundary — small enough (six fields) that MapStruct
 * would only add ceremony (see contracts-and-clients skill reference).
 */
public final class MembershipDtoMapper {

    private MembershipDtoMapper() {
    }

    public static MembershipDTO toDto(final Membership membership) {
        final MembershipDTO dto = new MembershipDTO(
                membership.memberId().value().toString(),
                MembershipTierDTO.valueOf(membership.tier().name()),
                MembershipStatusDTO.valueOf(membership.status().name()));
        dto.setStartedAt(toLocalDateTime(membership.startedAt()));
        dto.setRenewedAt(JsonNullable.of(toLocalDateTime(membership.renewedAt())));
        dto.setEndsAt(JsonNullable.of(toLocalDateTime(membership.endsAt())));
        return dto;
    }

    private static LocalDateTime toLocalDateTime(final Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}
