package global.oei.application.web.adapter;

import global.oei.domain.shared.membership.Membership;

/**
 * Adapter interface between the {@code MembershipResource} primary adapter and the domain.
 *
 * <p>Convention: a {@code *Resource} never injects a domain-shared port/use-case interface
 * directly — it injects a {@code *Adapter} interface declared next to it in this module.
 * The concrete implementation lives in the sibling {@code service} package (never a
 * {@code *Impl}/{@code impl} package) and is the one that actually depends on
 * {@code domain-shared} ports/use cases.</p>
 */
public interface MembershipAdapter {

    /**
     * @throws org.springframework.web.server.ResponseStatusException {@code 401} when there
     *         is no authenticated caller, {@code 404} when the caller has no membership yet.
     */
    Membership getMyMembership();
}
