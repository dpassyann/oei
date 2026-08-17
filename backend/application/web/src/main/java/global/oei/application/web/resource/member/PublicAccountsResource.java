package global.oei.application.web.resource.member;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.PublicAccountsApi;
import global.oei.application.web.model.AccountRegistrationDTO;
import global.oei.application.web.model.MemberDTO;
import global.oei.application.web.resource.member.mapper.MemberDtoMapper;
import global.oei.domain.shared.member.MemberAlreadyRegisteredException;
import global.oei.domain.shared.member.RegisterAccountUseCase;

/**
 * Implements {@link PublicAccountsApi}. See {@code RegisterAccountService}'s Javadoc for the
 * exact (intentionally minimal) scope of account creation at this bootstrap stage.
 */
@RestController
@RequiredArgsConstructor
public class PublicAccountsResource implements PublicAccountsApi {

    private final RegisterAccountUseCase registerAccountUseCase;

    @Override
    public ResponseEntity<MemberDTO> registerAccount(final AccountRegistrationDTO registration) {
        try {
            final var member = registerAccountUseCase.execute(
                    registration.getEmail(), registration.getLocale(), registration.getCountry(),
                    Boolean.TRUE.equals(registration.getConsentAccepted()), registration.getOidcSubject());
            return ResponseEntity.status(HttpStatus.CREATED).body(MemberDtoMapper.toDto(member));
        } catch (final MemberAlreadyRegisteredException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        }
    }
}
