package global.oei.acceptance;

/**
 * Bearer tokens for {@link AcceptanceTestSecurityConfig}'s fake {@code JwtDecoder}, keyed to
 * real seeded demo members (0004-demo-members-and-compensation) so the resulting
 * {@code MemberId} resolves to real data.
 *
 * <p>Fields use {@code .} (not {@code |}) as the subject/roles separator: Spring Security's
 * {@code DefaultBearerTokenResolver} validates the raw {@code Authorization: Bearer ...} header
 * value against the RFC 6750 {@code token68} character set ({@code A-Za-z0-9-._~+/=}) *before*
 * any {@code JwtDecoder} bean ever sees it, and {@code |} is not part of that set — such a
 * token is rejected upstream with a generic "Bearer token is malformed" 401, never reaching our
 * fake decoder at all.</p>
 */
final class AcceptanceTestTokens {

    /** Alice Nguyen — demo member, {@code member} role. */
    static final String ALICE_MEMBER = "f267e070-2fd5-5f83-a48b-9a733db64489.member";

    static final String ADMIN = "00000000-0000-0000-0000-000000000000.admin";

    private AcceptanceTestTokens() {
    }
}
