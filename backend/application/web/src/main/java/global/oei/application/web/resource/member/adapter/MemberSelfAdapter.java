package global.oei.application.web.resource.member.adapter;

import global.oei.application.web.model.MemberDTO;

/**
 * Adapter interface between the member-self endpoint and the domain.
 *
 * <p>Convention: a {@code *Resource} never injects a domain-shared port/use-case interface
 * directly — it injects a {@code *Adapter} interface declared next to it in this module.</p>
 */
public interface MemberSelfAdapter {

    /**
     * Returns the {@link MemberDTO} (with membership) for the currently authenticated
     * caller.  If no {@code Member} record exists yet for the caller's Keycloak subject (i.e.
     * the user registered via the native Keycloak form without going through
     * {@code POST /api/public/v1/accounts}), one is auto-provisioned from the JWT claims
     * together with a BRONZE/PENDING {@code Membership}.
     *
     * @throws org.springframework.web.server.ResponseStatusException 401 when there is no
     *         authenticated caller.
     */
    MemberDTO getCurrentMember();
}

