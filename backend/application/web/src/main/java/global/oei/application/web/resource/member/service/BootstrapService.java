package global.oei.application.web.resource.member.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.resource.member.adapter.BootstrapAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.GetMemberBootstrapUseCase;
import global.oei.domain.shared.profile.MemberBootstrap;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Implements {@link BootstrapAdapter} by delegating to {@link GetMemberBootstrapUseCase}.
 */
@Service
@RequiredArgsConstructor
public class BootstrapService implements BootstrapAdapter {

    private final SecurityContextPort securityContextPort;
    private final GetMemberBootstrapUseCase getMemberBootstrapUseCase;

    @Override
    public MemberBootstrap getBootstrap() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return getMemberBootstrapUseCase.execute(MemberId.of(identity.subject()));
    }
}

