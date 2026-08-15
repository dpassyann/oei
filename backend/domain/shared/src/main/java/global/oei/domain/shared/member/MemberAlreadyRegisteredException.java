package global.oei.domain.shared.member;

/**
 * Thrown by {@link RegisterAccountUseCase} when the derived {@link Member#publicSlug()} (or,
 * later, a real email-uniqueness check once email is modeled) collides with an existing
 * member. Mapped to HTTP 409 by {@code application-web}.
 */
public class MemberAlreadyRegisteredException extends RuntimeException {

    public MemberAlreadyRegisteredException(final String message) {
        super(message);
    }
}
