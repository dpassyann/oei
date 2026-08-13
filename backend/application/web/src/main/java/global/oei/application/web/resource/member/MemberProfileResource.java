package global.oei.application.web.resource.member;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberProfileApi;
import global.oei.application.web.model.GetMyEntitlements200ResponseDTO;
import global.oei.application.web.model.MembershipDTO;
import global.oei.application.web.model.ProfessionalProfileDTO;
import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.application.web.resource.member.adapter.ProfileAdapter;
import global.oei.application.web.resource.member.mapper.MembershipDtoMapper;
import global.oei.application.web.resource.member.mapper.ProfileDtoMapper;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;

/**
 * Implements the "member" domain's operations of {@link MemberProfileApi}: membership,
 * entitlements, and professional profile. A single {@code @RestController} bean is required
 * per generated API interface (every method's {@code @RequestMapping} is inherited from the
 * interface, so two beans implementing the same interface would double-register every
 * route) — membership/entitlements/profile share this one class even though they use
 * separate {@code *Adapter}/{@code service.*Service} pairs internally.
 *
 * <p>Only these four operations are implemented so far; {@code signEthicalCharter} falls
 * back to the generator's default {@code 501 Not Implemented} behavior until implemented.</p>
 *
 * <p>{@code @RestController} + Lombok {@code @RequiredArgsConstructor}: discovered by
 * {@code OeiBackendApplication}'s own {@code @SpringBootApplication} component scan (scoped
 * to this module's package tree — see the spring-boot-ddd-backend skill's "Explicit wiring
 * — scoped to cross-module/domain boundaries only" rule), never registered via a
 * handwritten {@code @Bean} method.</p>
 */
@RestController
@RequiredArgsConstructor
public class MemberProfileResource implements MemberProfileApi {

    private final MembershipAdapter membershipAdapter;
    private final ProfileAdapter profileAdapter;

    @Override
    public ResponseEntity<MembershipDTO> getMyMembership() {
        return ResponseEntity.ok(MembershipDtoMapper.toDto(membershipAdapter.getMyMembership()));
    }

    @Override
    public ResponseEntity<GetMyEntitlements200ResponseDTO> getMyEntitlements() {
        return ResponseEntity.ok(MembershipDtoMapper.toEntitlementsDto(membershipAdapter.getMyMembership()));
    }

    @Override
    public ResponseEntity<ProfessionalProfileDTO> getMyProfile() {
        return ResponseEntity.ok(ProfileDtoMapper.toDto(profileAdapter.getMyProfile()));
    }

    @Override
    public ResponseEntity<ProfessionalProfileDTO> updateMyProfile(final ProfessionalProfileDTO professionalProfileDTO) {
        // The real memberId is resolved from the authenticated caller by ProfileService,
        // overriding whatever this request body carried (see ProfessionalProfile#withMemberId).
        final var submitted = ProfileDtoMapper.toDomain(MemberId.newId(), professionalProfileDTO);
        return ResponseEntity.ok(ProfileDtoMapper.toDto(profileAdapter.updateMyProfile(submitted)));
    }
}
