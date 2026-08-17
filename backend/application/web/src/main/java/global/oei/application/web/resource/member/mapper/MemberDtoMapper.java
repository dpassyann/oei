package global.oei.application.web.resource.member.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.MemberDTO;
import global.oei.domain.shared.member.Member;

/**
 * Maps {@link Member} to {@link MemberDTO}. {@code membership} is left unset: no {@code
 * Membership} row exists for a freshly-registered account (see {@code RegisterAccountService}'s
 * Javadoc), and {@link global.oei.domain.shared.membership.MembershipLookupPort} is a
 * per-member lookup not wired into every caller of this mapper (e.g. {@code listAdminMembers}
 * lists members regardless of membership status).
 */
@UtilityClass
public class MemberDtoMapper {

    public MemberDTO toDto(final Member member) {
        final MemberDTO dto = new MemberDTO(
                member.id().value().toString(), member.publicSlug(), member.displayName(), member.locale(), member.country());
        dto.setLegalName(member.legalName());
        dto.setCreatedAt(LocalDateTime.ofInstant(member.createdAt(), ZoneOffset.UTC));
        return dto;
    }
}
