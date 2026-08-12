package global.oei.application.web.resource.member;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberProfileApi;
import global.oei.application.web.model.MembershipDTO;
import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.application.web.resource.member.mapper.MembershipDtoMapper;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@code GET /api/member/v1/membership}.
 *
 * <p>Only this operation is implemented at this bootstrap stage; every other operation in
 * {@link MemberProfileApi} (and the other ~30 generated API interfaces) falls back to the
 * generator's default {@code 501 Not Implemented} behavior until implemented.</p>
 *
 * <p>Convention: a {@code *Resource} (never {@code *Controller}) injects only a
 * {@code *Adapter} interface (never a {@code domain-shared} port/use case directly) — see
 * {@link MembershipAdapter}. {@code @RestController} + Lombok {@code @RequiredArgsConstructor}:
 * discovered by {@code OeiBackendApplication}'s own {@code @SpringBootApplication} component
 * scan (scoped to this module's package tree — see the spring-boot-ddd-backend skill's
 * "Explicit wiring — scoped to cross-module/domain boundaries only" rule), never registered
 * via a handwritten {@code @Bean} method. Lives at the root of the {@code resource.member}
 * bounded-context package (domain-first packaging: the domain is the first-level package,
 * {@code adapter}/{@code service}/{@code mapper} are technical subpackages nested inside it).</p>
 */
@RestController
@RequiredArgsConstructor
public class MembershipResource implements MemberProfileApi {

    private final MembershipAdapter membershipAdapter;

    @Override
    public ResponseEntity<MembershipDTO> getMyMembership() {
        return ResponseEntity.ok(MembershipDtoMapper.toDto(membershipAdapter.getMyMembership()));
    }
}
