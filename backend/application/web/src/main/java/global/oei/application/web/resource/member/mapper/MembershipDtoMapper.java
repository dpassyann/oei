package global.oei.application.web.resource.member.mapper;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.GetMyEntitlements200ResponseDTO;
import global.oei.application.web.model.MembershipDTO;
import global.oei.application.web.model.MembershipEntitlementDTO;
import global.oei.application.web.model.MembershipStatusDTO;
import global.oei.application.web.model.MembershipTierDTO;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipEntitlement;

/**
 * Explicit hand-written mapping between the domain {@link Membership} and the generated
 * {@link MembershipDTO} at the HTTP boundary — small enough (six fields) that MapStruct
 * would only add ceremony (see contracts-and-clients skill reference).
 *
 * <p>{@code @UtilityClass} (rather than {@code @NoArgsConstructor(access = PRIVATE)}) is
 * the idiomatic Lombok pattern for a static-methods-only helper: it makes the class
 * {@code final}, adds the private no-args constructor, and makes every member static
 * automatically — no need to repeat {@code static} on each method.</p>
 */
@UtilityClass
public class MembershipDtoMapper {

    public MembershipDTO toDto(final Membership membership) {
        final MembershipDTO dto = new MembershipDTO(
                membership.memberId().value().toString(),
                MembershipTierDTO.valueOf(membership.tier().name()),
                MembershipStatusDTO.valueOf(membership.status().name()));
        dto.setStartedAt(toLocalDateTime(membership.startedAt()));
        dto.setRenewedAt(JsonNullable.of(toLocalDateTime(membership.renewedAt())));
        dto.setEndsAt(JsonNullable.of(toLocalDateTime(membership.endsAt())));
        return dto;
    }

    private LocalDateTime toLocalDateTime(final Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    public GetMyEntitlements200ResponseDTO toEntitlementsDto(final Membership membership) {
        final List<MembershipEntitlementDTO> entitlements = membership.status().entitlements().stream()
                .map(MembershipEntitlement::name)
                .map(MembershipEntitlementDTO::valueOf)
                .toList();
        return new GetMyEntitlements200ResponseDTO(MembershipStatusDTO.valueOf(membership.status().name()), entitlements);
    }
}
