package global.oei.application.web.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberProfileApi;
import global.oei.application.web.adapter.MembershipAdapter;
import global.oei.application.web.mapper.MembershipDtoMapper;
import global.oei.application.web.model.MembershipDTO;
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
 * {@link MembershipAdapter}. Registered as an explicit {@code @Bean} in
 * {@code WebResourcesConfiguration}, not discovered via component scanning.</p>
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
