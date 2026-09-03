package global.oei.application.web.resource.member;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberProfileApi;
import global.oei.application.web.model.EthicalCharterSignatureDTO;
import global.oei.application.web.model.GetMyEntitlements200ResponseDTO;
import global.oei.application.web.model.MemberBootstrapDTO;
import global.oei.application.web.model.MemberDTO;
import global.oei.application.web.model.MembershipDTO;
import global.oei.application.web.model.ProfessionalProfileDTO;
import global.oei.application.web.model.SignEthicalCharterRequestDTO;
import global.oei.application.web.resource.member.adapter.BootstrapAdapter;
import global.oei.application.web.resource.member.adapter.CharterAdapter;
import global.oei.application.web.resource.member.adapter.MemberSelfAdapter;
import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.application.web.resource.member.adapter.ProfileAdapter;
import global.oei.application.web.resource.member.mapper.BootstrapDtoMapper;
import global.oei.application.web.resource.member.mapper.CharterDtoMapper;
import global.oei.application.web.resource.member.mapper.MembershipDtoMapper;
import global.oei.application.web.resource.member.mapper.ProfileDtoMapper;
import global.oei.domain.shared.member.MemberId;

/**
 * Implements every "member" domain operation of {@link MemberProfileApi}: membership,
 * entitlements, professional profile, and ethical charter signing. A single
 * {@code @RestController} bean is required per generated API interface (every method's
 * {@code @RequestMapping} is inherited from the interface, so two beans implementing the
 * same interface would double-register every route) — all four operations share this one
 * class even though they use separate {@code *Adapter}/{@code service.*Service} pairs
 * internally.
 *
 * <p>The {@code member-profile-import} operations (Smart CV Import + LinkedIn OAuth callback)
 * live in {@link global.oei.application.web.resource.member.ProfileImportResource} instead,
 * as the sole implementer of {@link global.oei.application.web.MemberProfileImportApi} — see
 * that class's Javadoc.</p>
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
    private final CharterAdapter charterAdapter;
    private final MemberSelfAdapter memberSelfAdapter;
    private final BootstrapAdapter bootstrapAdapter;

    /**
     * Bootstrap endpoint — returns profile and membership state so the frontend can decide
     * the landing experience without additional API calls.
     *
     * <p>Note: {@link MemberBootstrapDTO} and {@code getMemberBootstrap()} will be present
     * in {@link MemberProfileApi} after {@code mvn generate-sources} regenerates the API
     * from the updated OpenAPI contract. Un-comment the {@code @Override} annotation when
     * the interface method becomes available.</p>
     */
    // @Override — activated after mvn generate-sources
    public ResponseEntity<MemberBootstrapDTO> getMemberBootstrap() {
        return ResponseEntity.ok(BootstrapDtoMapper.toDto(bootstrapAdapter.getBootstrap()));
    }

    @Override
    public ResponseEntity<MemberDTO> getCurrentMember() {
        return ResponseEntity.ok(memberSelfAdapter.getCurrentMember());
    }

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

    @Override
    public ResponseEntity<EthicalCharterSignatureDTO> signEthicalCharter(
            final SignEthicalCharterRequestDTO signEthicalCharterRequestDTO) {
        final var signature = charterAdapter.signEthicalCharter(signEthicalCharterRequestDTO.getVersion());
        return ResponseEntity.status(HttpStatus.CREATED).body(CharterDtoMapper.toDto(signature));
    }
}
