package global.oei.domain.shared.member;

/**
 * Inbound port: register a new member account. See {@code RegisterAccountService}'s Javadoc
 * for the exact (intentionally minimal) scope of this bootstrap-stage operation.
 */
public interface RegisterAccountUseCase {

    Member execute(String email, String locale, String country, boolean consentAccepted, String oidcSubject);
}
