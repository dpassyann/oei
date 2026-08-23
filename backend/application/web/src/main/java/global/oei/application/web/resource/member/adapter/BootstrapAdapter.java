package global.oei.application.web.resource.member.adapter;

import global.oei.domain.shared.profile.MemberBootstrap;

/**
 * Adapter interface for the bootstrap endpoint — follows the same
 * {@code *Adapter}/{@code service.*Service} convention as {@link MembershipAdapter}.
 */
public interface BootstrapAdapter {

    MemberBootstrap getBootstrap();
}

